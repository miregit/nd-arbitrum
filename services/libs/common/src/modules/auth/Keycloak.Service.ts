import { setTimeout } from "timers/promises"
import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common"
import {
  KeycloakResponse,
  KeycloakJwt,
  KeycloakUser,
  KeycloakUserRequest,
  KeycloakRoleRequest,
  KeycloakRole,
  KeycloakUserCredentials,
  KeycloakVerifyEmailRequest,
  CreateKeycloakUser,
  UpdateUserAttribute,
  JwtClaim,
  CreateServiceAccountClient,
  CreateClientRequest as CreateServiceAccountClientRequest,
  ClientSecretResponse,
  ClientSecretRequest,
  KeycloakClient,
  KeycloakServiceAccountResponse,
  keycloakAttributeValue,
  keycloakAttributeValueArray,
  KeycloakResetPasswordRequest,
} from "./Auth.Model"
import { AxiosService } from "../web/Axios.Service"
import { InjectPinoLogger, PinoLogger } from "nestjs-pino"
import { badRequest } from "../web/Error.Model"
import { EnvVarsHandler } from "../env-vars-checker/EnvVars.Handler"
import { ApiErrorCode } from "@nd-demo/common"
import { ethers } from "ethers"

@Injectable()
export class KeycloakService {
  constructor(
    private axios: AxiosService,
    private envVarsHandler: EnvVarsHandler,
    @InjectPinoLogger(KeycloakService.name) readonly logger: PinoLogger,
  ) {}

  endpoint = this.envVarsHandler.getValueAndCheck("KEYCLOAK_ENDPOINT")
  host = this.envVarsHandler.getValueAndCheck("KEYCLOAK_HOST")
  realm = this.envVarsHandler.getValueAndCheck("KEYCLOAK_REALM")
  clientId = this.envVarsHandler.getValueAndCheck("KEYCLOAK_CLIENT_ID")
  clientSecret = this.envVarsHandler.getValueAndCheck("KEYCLOAK_CLIENT_SECRET")
  adminUsername = this.envVarsHandler.getValueAndCheck("KEYCLOAK_REALM_ADMIN_USER")
  adminPassword = this.envVarsHandler.getValueAndCheck("KEYCLOAK_ADMIN_PASSWORD")

  async login(username: string, password: string): Promise<KeycloakResponse> {
    return await this.auth(
      {
        scope: "openid",
        username,
        password,
      },
      this.clientId,
      this.realm,
      "password",
    )
  }

  async adminRealmLogin(): Promise<KeycloakResponse> {
    return await this.auth(
      {
        scope: "openid",
        username: this.adminUsername,
        password: this.adminPassword,
      },
      this.clientId,
      this.realm,
      "password",
    )
  }

  serviceAdminRealmLogin(): Promise<KeycloakResponse> {
    return this.retry(() => this.adminRealmLogin())
  }

  async refresh(refresh_token: string): Promise<KeycloakResponse> {
    return await this.auth({ refresh_token }, this.clientId, this.realm, "refresh_token")
  }

  private async auth(
    args: { username: string; password: string; scope: string } | { refresh_token: string },
    clientId: string,
    realm: string,
    grant_type: "password" | "refresh_token",
  ): Promise<KeycloakResponse> {
    const data = Object.entries({
      ...args,
      grant_type,
      client_id: clientId,
      client_secret: this.clientSecret,
    })
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join("&")

    try {
      return await this.axios.post<unknown, KeycloakResponse>(
        `${this.endpoint}/realms/${realm}/protocol/openid-connect/token`,
        data,
        {
          "Content-Type": "application/x-www-form-urlencoded",
          Cookie: "JSESSIONID=13754D35CAFC198E1E60A353DB352C07",
          Host: this.host,
        },
      )
    } catch (e) {
      throw new UnauthorizedException()
    }
  }

  async clientAuth(
    clientId: string,
    clientIdSecret: string,
    realm: string,
    grant_type = "client_credentials",
    scopeType = "openid",
  ): Promise<KeycloakResponse> {
    const data = Object.entries({
      grant_type: grant_type,
      scope: scopeType,
      client_id: clientId,
      client_secret: clientIdSecret,
    })
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join("&")

    try {
      return await this.axios.post<unknown, KeycloakResponse>(
        `${this.endpoint}/realms/${realm}/protocol/openid-connect/token`,
        data,
        {
          "Content-Type": "application/x-www-form-urlencoded",
          Cookie: "JSESSIONID=13754D35CAFC198E1E60A353DB352C06",
          Host: this.host,
        },
      )
    } catch (e) {
      throw new UnauthorizedException()
    }
  }

  parseJwt(jwt: string): KeycloakJwt {
    const sections = (jwt || "").split(".")
    if (sections.length <= 2) throw new UnauthorizedException()
    return JSON.parse(Buffer.from(sections[1], "base64").toString("utf8"))
  }

  getKeycloakUsersByRole(role: string, jwt: string): Promise<KeycloakUser[]> {
    return this.axios.get<KeycloakUser[]>(`${this.endpoint}/admin/realms/${this.realm}/roles/${role}/users`, {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwt}`,
      Host: this.host,
    })
  }

  getKeycloakUsersById(userId: string, jwt: string): Promise<KeycloakUser> {
    return this.axios.get<KeycloakUser>(`${this.endpoint}/admin/realms/${this.realm}/users/${userId}`, {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwt}`,
      Host: this.host,
    })
  }

  async getKeycloakUsersByUsername(username: string, jwt: string): Promise<KeycloakUser> {
    const response = await this.axios.get<KeycloakUser[]>(
      `${this.endpoint}/admin/realms/${this.realm}/users/?username=${username}`,
      {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
        Host: this.host,
      },
    )
    const user = response.pop()
    if (!user) throw badRequest(ApiErrorCode.USER_NOT_FOUND)
    return user
  }

  async getKeycloakUsersByEmail(email: string, jwt: string): Promise<KeycloakUser | undefined> {
    const response = await this.axios.get<KeycloakUser[]>(
      `${this.endpoint}/admin/realms/${this.realm}/users/?email=${email}`,
      {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
        Host: this.host,
      },
    )
    const user = response.pop()
    if (!user) return undefined
    return user
  }

  async createKeycloakUser(user: CreateKeycloakUser, jwt: string): Promise<string> {
    return await this.axios.post<KeycloakUserRequest, string>(
      `${this.endpoint}/admin/realms/${this.realm}/users`,
      {
        username: user.emailAddress,
        email: user.emailAddress,
        enabled: true,
        emailVerified: user.isEmailVerified,
        firstName: user.fullname,
        credentials: this.defaultCredentials(user.password),
        requiredActions: user.isEmailVerified ? [] : ["VERIFY_EMAIL"],
        attributes: {},
      },
      {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
        Host: this.host,
      },
    )
  }

  async sendKeycloakVerifyEmail(userId: string, access_token: string): Promise<string> {
    return await this.axios.put<KeycloakVerifyEmailRequest, string>(
      `${this.endpoint}/admin/realms/${this.realm}/users/${userId}/send-verify-email`,
      {
        redirect_uri: null,
      },
      {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
        Host: this.host,
      },
    )
  }

  async sendKeycloakResetPasswordEmail(userId: string, access_token: string): Promise<string> {
    try {
      await this.axios.put<string[], string>(
        `${this.endpoint}/admin/realms/${this.realm}/users/${userId}/execute-actions-email`,
        ["UPDATE_PASSWORD"],
        {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access_token}`,
          Host: this.host,
        },
      )
      return userId
    } catch (e) {
      return ""
    }
  }

  async updateOnboardingAttribute(userId: JwtClaim, value: boolean): Promise<string> {
    const adminResponse = await this.adminRealmLogin()
    const userInfo = await this.getKeycloakUsersById(userId.sub, adminResponse.access_token)
    const res = await this.axios.put<UpdateUserAttribute, string>(
      `${this.endpoint}/admin/realms/${this.realm}/users/${userId.sub}`,
      {
        attributes: {
          ...userInfo.attributes,
          isFinishedOnboarding: value,
        },
      },
      {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminResponse.access_token}`,
        Host: this.host,
      },
    )
    return res
  }

  async isEmailVerified(username: string, access_token: string): Promise<boolean> {
    const response = await this.getKeycloakUsersByUsername(username, access_token)
    return response.emailVerified
  }

  defaultCredentials(defaultPassword?: string): KeycloakUserCredentials[] {
    if (!defaultPassword) return []
    return [
      {
        type: "password",
        value: defaultPassword,
        temporary: false,
      },
    ]
  }

  createKeycloakRoleMapping(userId: string, roleId: string, roleName: string, jwt: string): Promise<string> {
    return this.axios.post<KeycloakRoleRequest[], string>(
      `${this.endpoint}/admin/realms/${this.realm}/users/${userId}/role-mappings/realm`,
      [
        {
          id: roleId,
          name: roleName,
        },
      ],
      {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
        Host: this.host,
      },
    )
  }

  async createKeycloakUserWithAttributes(createUser: CreateKeycloakUser, jwt: string): Promise<string> {
    try {
      await this.createKeycloakUser(createUser, jwt)
      const user = await this.getKeycloakUsersByUsername(createUser.emailAddress, jwt)
      const keycloakRole = await this.getRole(createUser.role, jwt)
      await this.createKeycloakRoleMapping(user.id, keycloakRole.id, createUser.role, jwt)
      return user.id
    } catch (e) {
      if (e instanceof ConflictException) {
        throw badRequest(ApiErrorCode.USER_ALREADY_EXISTS)
      } else {
        throw badRequest(e)
      }
    }
  }

  async getRole(role: string, jwt: string): Promise<KeycloakRole> {
    const response = await this.axios.get<KeycloakRole[]>(`${this.endpoint}/admin/realms/${this.realm}/roles`, {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwt}`,
      Host: this.host,
    })
    return response.find((keycloakRole) => keycloakRole.name === role)
  }

  async retry<T>(request: () => Promise<T>, backPressure = 15000, retries = 1, maxRetries = 3): Promise<T> {
    const response = await this.attemptRequest(request())
    if (response) return response
    if (retries - 1 >= maxRetries) {
      throw new Error(`failed after ${maxRetries} retries`)
    } else {
      return setTimeout(backPressure * retries).then(() => this.retry(request, backPressure, retries + 1))
    }
  }

  async attemptRequest<T>(request: Promise<T>): Promise<T | undefined> {
    try {
      const response = await request
      return response
    } catch (e) {
      this.logger.error({ exception: e })
      return undefined
    }
  }

  async createServiceAccountClient(createClient: CreateServiceAccountClient, bearerToken: string): Promise<string> {
    const { clientName } = createClient
    const ACCESS_TOKEN_LIFESPAN = 2629800
    const clientId = ethers.id(clientName)

    await this.axios.post<CreateServiceAccountClientRequest, string>(
      `${this.endpoint}/admin/realms/${this.realm}/clients`,
      {
        clientId,
        name: clientName,
        description: `Client for ${clientName}`,
        serviceAccountsEnabled: true,
        authorizationServicesEnabled: true,
        publicClient: false,
        directAccessGrantsEnabled: true,
        protocolMappers: [
          {
            name: "company",
            protocol: "openid-connect",
            protocolMapper: "oidc-hardcoded-claim-mapper",
            consentRequired: false,
            config: {
              "claim.value": keycloakAttributeValue(clientName),
              "userinfo.token.claim": "true",
              "id.token.claim": "true",
              "access.token.claim": "true",
              "claim.name": "company",
              "jsonType.label": "JSON",
            },
          },
          {
            name: "system_role",
            protocol: "openid-connect",
            protocolMapper: "oidc-hardcoded-claim-mapper",
            consentRequired: false,
            config: {
              "claim.value": keycloakAttributeValueArray(createClient.systemRole),
              "userinfo.token.claim": "true",
              "id.token.claim": "true",
              "access.token.claim": "true",
              "claim.name": "system_role",
              "jsonType.label": "JSON",
            },
          },
        ],
        attributes: {
          "access.token.lifespan": ACCESS_TOKEN_LIFESPAN,
        },
      },
      {
        "Content-Type": "application/json",
        Authorization: bearerToken,
        Host: this.host,
      },
    )

    return clientId
  }

  async getAllClients(bearerToken: string): Promise<KeycloakClient[]> {
    try {
      return await this.axios.get(`${this.endpoint}/admin/realms/${this.realm}/clients`, {
        Authorization: bearerToken,
        Host: this.host,
      })
    } catch (e) {
      if (e instanceof ConflictException) {
        throw badRequest(ApiErrorCode.CLIENT_REQUEST_FAILED)
      } else {
        throw badRequest(e)
      }
    }
  }

  async getClientByClientId(clientId: string, accessToken: string): Promise<KeycloakClient> {
    const allClients = await this.getAllClients(accessToken)
    const client = allClients.find((client) => client["clientId"] === clientId)
    return client
  }

  async fetchClientSecret(id: string, bearerToken: string): Promise<string | undefined> {
    const data = await this.axios.get<ClientSecretResponse>(
      `${this.endpoint}/admin/realms/${this.realm}/clients/${id}/client-secret`,
      {
        Authorization: bearerToken,
      },
    )
    return data?.value
  }

  async generateClientSecret(id: string, bearerToken: string): Promise<string> {
    const data = await this.axios.post<ClientSecretRequest, ClientSecretResponse>(
      `${this.endpoint}/admin/realms/${this.realm}/clients/${id}/client-secret`,
      {
        client: id,
        realm: this.realm,
      },
      {
        Authorization: bearerToken,
        "Content-Type": "application/json",
        HOST: this.host,
      },
    )

    if (!data?.value) {
      throw new Error(`Client secret generation failled for id: ${id}`)
    }
    return data.value
  }

  async issueJwtToken(clientId: string, clientSecret: string): Promise<KeycloakServiceAccountResponse> {
    const tokenEndpoint = `${this.endpoint}/realms/${this.realm}/protocol/openid-connect/token`
    const data = `client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`

    return await this.axios.post(tokenEndpoint, data, {
      "Content-Type": "application/x-www-form-urlencoded",
    })
  }

  async clientSecretFindOrCreate(id: string, accessToken: string): Promise<string> {
    const clientSecret = await this.fetchClientSecret(id, accessToken)
    if (clientSecret) return clientSecret
    return await this.generateClientSecret(id, accessToken)
  }

  async resetPassword(userId: string, password: string, bearerToken: string): Promise<void> {
    await this.axios.put<KeycloakResetPasswordRequest, void>(
      `${this.endpoint}/admin/realms/${this.realm}/users/${userId}/reset-password`,
      {
        value: password,
        temporary: false,
      },
      {
        Authorization: bearerToken,
        "Content-Type": "application/json",
        HOST: this.host,
      },
    )
  }
}
