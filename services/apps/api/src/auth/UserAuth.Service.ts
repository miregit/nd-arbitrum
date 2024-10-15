import { Injectable } from "@nestjs/common"
import { JwtService, KeycloakService, ApiErrorCode, badRequest } from "@nd-demo/common"
import { UserSessionInfo, UserSessionToken } from "./UserAuth.Model"
import { userSessionMapper, userSessionTokenMapper } from "./UserAuth.Mapper"
@Injectable()
export class UserAuthService {
  constructor(private readonly keycloakService: KeycloakService, private readonly jwtService: JwtService) {}

  async createUserSession(username: string, password: string): Promise<UserSessionToken> {
    const response = await this.keycloakService.login(username, password)
    if (!response) throw badRequest(ApiErrorCode.PROBLEM_WITH_USERNAME_OR_PASSWORD)
    const jwt = this.jwtService.decodeJwtClaim(response.access_token)
    return userSessionTokenMapper(response, jwt)
  }

  async refreshUserSession(refreshToken: string): Promise<UserSessionToken> {
    const response = await this.keycloakService.refresh(refreshToken)
    const jwt = this.jwtService.decodeJwtClaim(response.access_token)
    return userSessionTokenMapper(response, jwt)
  }

  getUserSessionInfo(bearer: string): UserSessionInfo {
    const jwt = this.jwtService.decodeJwt(bearer)
    return userSessionMapper(jwt)
  }
}
