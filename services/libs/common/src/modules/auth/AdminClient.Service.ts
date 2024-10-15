import { Injectable } from "@nestjs/common"
import { VaultService } from "../vault/Vault.Service"
import { EnvVarsHandler } from "../env-vars-checker/EnvVars.Handler"
import { KeycloakService } from "./Keycloak.Service"
import { KeycloakClient, KeycloakResponse } from "./Auth.Model"

@Injectable()
export class AdminClientService {
  constructor(
    private vaultService: VaultService,
    private envVarsHandler: EnvVarsHandler,
    private keycloakService: KeycloakService,
  ) {}

  adminClientSecretName = this.envVarsHandler.getValueAndCheck("VAULT_ADMIN_CLIENT")
  adminClientRealm = this.envVarsHandler.getValueAndCheck("KEYCLOAK_REALM")

  async getAdminClientAccessToken(): Promise<KeycloakResponse> {
    const adminClientSecret = await this.vaultService.getSecret<KeycloakClient>(this.adminClientSecretName)
    const adminClientToken = await this.keycloakService.clientAuth(
      adminClientSecret.client_id,
      adminClientSecret.client_secret,
      this.adminClientRealm,
    )
    return adminClientToken
  }
}
