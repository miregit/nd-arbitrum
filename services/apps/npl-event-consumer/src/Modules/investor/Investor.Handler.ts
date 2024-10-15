import { ContractService, EngineOpenApiConfig, NotificationProtocolStream, WorkerAccountService } from "@nd-demo/common"
import { Injectable } from "@nestjs/common"
import { InjectPinoLogger, PinoLogger } from "nestjs-pino"

@Injectable()
export class InvestorHandler {
  constructor(
    private readonly engineOpenApiConfig: EngineOpenApiConfig,
    private readonly workerAccountService: WorkerAccountService,
    private readonly contractService: ContractService,
    @InjectPinoLogger(InvestorHandler.name) readonly logger: PinoLogger,
  ) {}
  async RegisterNewInvestorOnChain(data: NotificationProtocolStream): Promise<void> {
    try {
      const [investorAddress] = data.notification.arguments
      const workerJwt = await this.workerAccountService.getWorkerClientAccessToken()
      await this.contractService.registerNewInvestor(investorAddress.value)
      const header = this.engineOpenApiConfig.getHeaders(workerJwt.access_token)
      await this.engineOpenApiConfig.engineOpenApi.investorProvisionRequestActivationUpdate(
        data.notification.refId,
        undefined,
        undefined,
        header,
      )
      this.logger.info(`the new investor ${investorAddress.value} was added successfully to our system`)
    } catch (e) {
      this.logger.error(e)
    }
  }
}
