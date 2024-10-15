import { Injectable } from "@nestjs/common"
import { KeycloakService } from "../auth/Keycloak.Service"
import { VaultService } from "../vault/Vault.Service"
import { CreateKeycloakUser, JwtClaim, KeycloakUser } from "../auth/Auth.Model"
import { VaultUser } from "./User.Model"

@Injectable()
export class UserService {
  constructor(private readonly keycloakService: KeycloakService, private readonly vaultService: VaultService) {}
  async putKeypairInVault(secret: VaultUser): Promise<void> {
    await this.vaultService.createSecret<VaultUser>(
      {
        data: secret,
      },
      secret.address,
    )
  }

  async createKeycloakUser(user: CreateKeycloakUser, jwt: string): Promise<string> {
    const role = user.role.toLowerCase()
    const keycloakUserId = await this.keycloakService.createKeycloakUserWithAttributes(
      {
        fullname: user.fullname,
        emailAddress: user.emailAddress,
        password: user.password,
        role: role,
        attributes: user.attributes,
        isEmailVerified: true,
      },
      jwt,
    )
    return keycloakUserId
  }

  async sendKeycloakVerifyEmail(userId: string): Promise<string> {
    const adminResponse = await this.keycloakService.serviceAdminRealmLogin()
    const res = await this.keycloakService.sendKeycloakVerifyEmail(userId, adminResponse.access_token)
    return res
  }

  async sendKeycloakResetPasswordEmail(emailAddress: string): Promise<string> {
    const adminResponse = await this.keycloakService.serviceAdminRealmLogin()
    const keycloakUser = await this.keycloakService.getKeycloakUsersByUsername(emailAddress, adminResponse.access_token)
    const res = await this.keycloakService.sendKeycloakResetPasswordEmail(keycloakUser.id, adminResponse.access_token)
    return res
  }

  async sendKeycloakResetPasswordEmailbyKeycloakid(keycloakid: string): Promise<string> {
    const adminResponse = await this.keycloakService.serviceAdminRealmLogin()
    const res = await this.keycloakService.sendKeycloakResetPasswordEmail(keycloakid, adminResponse.access_token)
    return res
  }

  async setOnboardingAttribute(value: boolean, jwt: JwtClaim): Promise<string> {
    return await this.keycloakService.updateOnboardingAttribute(jwt, value)
  }

  async getKeycloakUserById(userId: string): Promise<KeycloakUser> {
    const adminResponse = await this.keycloakService.serviceAdminRealmLogin()
    return await this.keycloakService.getKeycloakUsersById(userId, adminResponse.access_token)
  }

  async getKeycloakUserByEmail(userEmail: string): Promise<KeycloakUser | undefined> {
    const adminResponse = await this.keycloakService.serviceAdminRealmLogin()
    return await this.keycloakService.getKeycloakUsersByEmail(userEmail, adminResponse.access_token)
  }

  async checkKeycloakUserExists(userEmail: string): Promise<boolean> {
    const user = await this.getKeycloakUserByEmail(userEmail)
    if (!user) {
      return false
    }
    return true
  }
}
