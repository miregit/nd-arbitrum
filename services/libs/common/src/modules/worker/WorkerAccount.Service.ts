import { Injectable } from "@nestjs/common"
import { EnvVarsHandler, KeycloakClient, KeycloakResponse, KeycloakService, VaultService } from "@nd-demo/common"
import { VaultUser } from "../user/User.Model"

@Injectable()
export class WorkerAccountService {
  constructor(
    private vaultService: VaultService,
    private envVarsHandler: EnvVarsHandler,
    private readonly keycloakService: KeycloakService,
  ) {}

  vaultWorkerAddressId = this.envVarsHandler.getValueAndCheck("VAULT_WORKER_ID")
  vaultWorkerId = this.envVarsHandler.getValueAndCheck("VAULT_WORKER_CLIENT")
  keycloakRealm = this.envVarsHandler.getValueAndCheck("KEYCLOAK_REALM")

  async getWorkerClientAccessToken(): Promise<KeycloakResponse> {
    const clientSecret = await this.vaultService.getSecret<KeycloakClient>(this.vaultWorkerId)
    const clientToken = await this.keycloakService.clientAuth(
      clientSecret.client_id,
      clientSecret.client_secret,
      this.keycloakRealm,
    )
    return clientToken
  }

  async getWorkerAddress(): Promise<string> {
    const response = await this.vaultService.getSecret<VaultUser>(this.vaultWorkerAddressId)
    return response.address
  }

  getWorkerLabel(): string {
    return this.vaultWorkerAddressId
  }
}
