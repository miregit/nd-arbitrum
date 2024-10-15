import {
  ContractService,
  DeployContractService,
  EngineOpenApiConfig,
  EnvVarsHandler,
  WorkerAccountService,
} from "@nd-demo/common"
import { Injectable } from "@nestjs/common"
import { InjectPinoLogger, PinoLogger } from "nestjs-pino"
import {
  AddInvestorToOpportunityNotificationProtocolStream,
  OpportunityDeployNotificationProtocolStream,
  PayInterestForOpportunityNotificationProtocolStream,
} from "./Opportunity.Model"
import {
  AddInvestorToOpportunityDataMapper,
  OpportunityDataMapper,
  payInterestForOpportunityDataMapper,
} from "./Opportunity.Mapper"

@Injectable()
export class OpportunityHandler {
  private readonly defaultWorkerAddress: string
  private readonly defaultWorkerPrivateKey: string
  constructor(
    private readonly engineOpenApiConfig: EngineOpenApiConfig,
    private readonly workerAccountService: WorkerAccountService,
    private readonly deployContractService: DeployContractService,
    private readonly contractService: ContractService,
    private readonly envVarsHandler: EnvVarsHandler,
    @InjectPinoLogger(OpportunityHandler.name) readonly logger: PinoLogger,
  ) {
    this.defaultWorkerAddress = this.envVarsHandler.getValueAndCheck("VAULT_WORKER_ADDRESS")
    this.defaultWorkerPrivateKey = this.envVarsHandler.getValueAndCheck("VAULT_WORKER_PRIVATE_KEY")
  }
  async deployNewOpportunityOnChain(data: OpportunityDeployNotificationProtocolStream): Promise<void> {
    try {
      const deploymentInputs = OpportunityDataMapper(data)
      const opportunityAddress = await this.deployContractService.deployAndRegisterOpportunity(deploymentInputs)
      await this.deployContractService.sendFund(
        {
          address: this.defaultWorkerAddress,
          privateKey: this.defaultWorkerPrivateKey,
        },
        opportunityAddress,
        0.2,
      )
      const workerJwt = await this.workerAccountService.getWorkerClientAccessToken()
      this.logger.info(opportunityAddress)

      const header = this.engineOpenApiConfig.getHeaders(workerJwt.access_token)
      const platformRes = await this.engineOpenApiConfig.engineOpenApi.opportunityRequestStartSubscriptionPeriod(
        data.notification.refId,
        { contractAdd: opportunityAddress, deployTime: Math.round(Date.now() / 1000) },
        undefined,
        undefined,
        header,
      )
      this.logger.info(platformRes.data["@state"])
      this.logger.info(`opportunity with the name ${deploymentInputs.name} was deployed successfully!`)
    } catch (e) {
      this.logger.error(e)
    }
  }

  async AddInvestorToOpportunityOnChain(data: AddInvestorToOpportunityNotificationProtocolStream): Promise<void> {
    try {
      const args = AddInvestorToOpportunityDataMapper(data)
      await this.contractService.addInvestorToOpportunity(args.contractAddress, args.investorAddress)
      const workerJwt = await this.workerAccountService.getWorkerClientAccessToken()
      const header = this.engineOpenApiConfig.getHeaders(workerJwt.access_token)
      await this.engineOpenApiConfig.engineOpenApi.opportunityRequestAddInvestorOnchain(
        data.notification.refId,
        { investorWalletAddress: args.investorAddress },
        undefined,
        undefined,
        header,
      )
      this.logger.info(`investor ${args.investorAddress} was added to Opportunity whitelist ${args.contractAddress}`)
    } catch (e) {
      this.logger.error(e)
    }
  }

  async payInterestOpportunityOnChain(data: PayInterestForOpportunityNotificationProtocolStream): Promise<void> {
    try {
      const args = payInterestForOpportunityDataMapper(data)
      await this.contractService.payInterestForOpportunity(args.opportunityAddress)
      const workerJwt = await this.workerAccountService.getWorkerClientAccessToken()
      const header = this.engineOpenApiConfig.getHeaders(workerJwt.access_token)
      await this.engineOpenApiConfig.engineOpenApi.opportunityRequestAddInterestPaymentRecordToHistory(
        data.notification.refId,
        { payDate: Math.round(Date.now() / 1000) },
        undefined,
        undefined,
        header,
      )
      this.logger.info(
        `interest was paid successfully to all investors as part of opportunity contract ${args.opportunityAddress}..`,
      )
    } catch (e) {
      this.logger.error(e)
    }
  }
}
