import { Injectable } from "@nestjs/common"
import { VaultCreatedResponse, VaultRequest, VaultResponse } from "./Vault.Model"
import { InjectPinoLogger, PinoLogger } from "nestjs-pino"
import { AxiosService } from "../web/Axios.Service"
import { EnvVarsHandler } from "../env-vars-checker/EnvVars.Handler"
import { vaultDataMapper } from "./Vault.Mapper"

@Injectable()
export class VaultService {
  constructor(
    private axios: AxiosService,
    private envVarsHandler: EnvVarsHandler,
    @InjectPinoLogger(VaultService.name) readonly logger: PinoLogger,
  ) {}

  endpoint = this.envVarsHandler.getValueAndCheck("VAULT_ENDPOINT")
  token = this.envVarsHandler.getValueAndCheck("VAULT_TOKEN")
  realm = this.envVarsHandler.getValueAndCheck("KEYCLOAK_REALM")

  async createSecret<T>(body: VaultRequest<T>, lookUpKey: string): Promise<VaultCreatedResponse> {
    return await this.axios.post<unknown, VaultCreatedResponse>(
      `${this.endpoint}/v1/secret/data/${this.realm}/${lookUpKey}`,
      body,
      {
        "Content-Type": "application/json",
        "X-Vault-Token": this.token,
      },
    )
  }

  async getSecret<T>(key: string): Promise<T> {
    const response = await this.axios.get<VaultResponse<T>>(`${this.endpoint}/v1/secret/data/${this.realm}/${key}`, {
      "Content-Type": "application/json",
      "X-Vault-Token": this.token,
    })
    return vaultDataMapper(response, this.logger)
  }
}
