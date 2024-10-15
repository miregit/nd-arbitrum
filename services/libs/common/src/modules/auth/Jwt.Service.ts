import { Injectable, UnauthorizedException } from "@nestjs/common"
import { verify, VerifyErrors, decode } from "jsonwebtoken"
import { JwtClaim, KeycloakCerts, TokenHeader, UserInfo } from "./Auth.Model"
import { PinoLogger, InjectPinoLogger } from "nestjs-pino"
import { AxiosService } from "../web/Axios.Service"
import jwkToPem = require("jwk-to-pem")
import { EnvVarsHandler } from "../env-vars-checker/EnvVars.Handler"

@Injectable()
export class JwtService {
  constructor(
    private axios: AxiosService,
    private envVarsHandler: EnvVarsHandler,
    @InjectPinoLogger(JwtService.name) readonly logger: PinoLogger,
  ) {}

  endpoint = this.envVarsHandler.getValueAndCheck("KEYCLOAK_ENDPOINT")
  realm = this.envVarsHandler.getValueAndCheck("KEYCLOAK_REALM")
  host = this.envVarsHandler.getValueAndCheck("KEYCLOAK_HOST")

  auth = async (bearer: string | undefined): Promise<UserInfo> => {
    const jwt = this.jwtFromBearer(bearer)
    if (!jwt) throw new UnauthorizedException()
    return await this.verifyJwt(jwt)
  }

  verifyJwt = async (jwt?: string): Promise<UserInfo> => {
    if (jwt === undefined) throw new UnauthorizedException()
    try {
      return await this.getUserInfo(jwt)
    } catch {
      throw new UnauthorizedException()
    }
  }

  getJwtClaim = (token: string, certs: KeycloakCerts): Promise<JwtClaim> => {
    const tokenSections = (token || "").split(".")
    if (tokenSections.length < 2) {
      this.logger.error({ message: "Malformed JWT" })
      throw new UnauthorizedException()
    }

    const header = this.parseTokenHeader(tokenSections[0])
    if (header === undefined) {
      this.logger.error({ message: "Malformed token header" })
      throw new UnauthorizedException()
    }

    const key = certs.keys.find((key) => key.kid === header.kid)
    if (key === undefined) {
      this.logger.error({ message: "Certificate not found" })
      throw new UnauthorizedException()
    }

    return new Promise((resolve, reject) => {
      verify(token, jwkToPem(key), (e: VerifyErrors | null, decoded: object | undefined) => {
        if (e) {
          this.logger.error({ error: e })
          reject(new UnauthorizedException())
        }
        const jwtClaim = decoded as JwtClaim
        return resolve({
          ...jwtClaim,
          token,
        })
      })
    })
  }

  parseTokenHeader = (tokenHeader: string): TokenHeader | undefined => {
    try {
      return JSON.parse(Buffer.from(tokenHeader, "base64").toString("utf8"))
    } catch (e) {
      this.logger.error(e)
      return undefined
    }
  }

  getPublicKeys = (): Promise<KeycloakCerts> => {
    return this.axios.get<KeycloakCerts>(`${this.endpoint}/realms/${this.realm}/protocol/openid-connect/certs`, {
      Accept: "application/json",
    })
  }

  decodeJwt = (bearer: string | undefined): JwtClaim => {
    const token = this.jwtFromBearer(bearer)
    if (!token) throw new UnauthorizedException()
    const jwtClaim = this.decodeJwtClaim(token)
    if (!jwtClaim) throw new UnauthorizedException()
    return jwtClaim
  }

  jwtFromBearer = (authorizationHeader: string | undefined): string | undefined => {
    if (!authorizationHeader) return undefined
    return authorizationHeader.split("Bearer ").pop()
  }

  decodeJwtClaim = (token: string): JwtClaim | undefined => {
    try {
      const jwtClaim = decode(token) as JwtClaim
      return {
        ...jwtClaim,
        token,
      }
    } catch (e) {
      this.logger.error(e)
      return undefined
    }
  }

  getUserInfo = (jwt): Promise<UserInfo> => {
    return this.axios.get<UserInfo>(`${this.endpoint}/realms/${this.realm}/protocol/openid-connect/userinfo`, {
      Accept: "application/json",
      Authorization: `Bearer ${jwt}`,
      Host: this.host,
    })
  }
}
