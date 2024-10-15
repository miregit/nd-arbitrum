import { Injectable } from "@nestjs/common"
import { InjectPinoLogger, PinoLogger } from "nestjs-pino"
import { VaultContract } from "./Deployment.Model"
import {
  DeployContractService,
  EnvVarsHandler,
  VaultService,
  VaultWallet,
  VaultWalletProviderService,
} from "@nd-demo/common"

@Injectable()
export class DeploymentService {
  private readonly managamentContractId: string
  private readonly opporunityContractId: string
  private readonly defaultWorkerAddressId: string
  private readonly defaultWorkerAddress: string
  private readonly defaultWorkerPrivateKey: string
  constructor(
    @InjectPinoLogger(DeploymentService.name) readonly logger: PinoLogger,
    private readonly deployContractService: DeployContractService,
    private readonly vaultService: VaultService,
    private readonly vaultWalletProviderService: VaultWalletProviderService,
    private readonly envVarsHandler: EnvVarsHandler,
  ) {
    this.managamentContractId = this.envVarsHandler.getValueAndCheck("VAULT_MANAGAMENT_CONTRACT_ID")
    this.opporunityContractId = this.envVarsHandler.getValueAndCheck("VAULT_OPPORTUNITY_CONTRACT_ID")
    this.defaultWorkerAddress = this.envVarsHandler.getValueAndCheck("VAULT_WORKER_ADDRESS")
    this.defaultWorkerPrivateKey = this.envVarsHandler.getValueAndCheck("VAULT_WORKER_PRIVATE_KEY")
    this.defaultWorkerAddressId = this.envVarsHandler.getValueAndCheck("VAULT_WORKER_ID")
  }

  contractName = this.envVarsHandler.getValueAndCheck("INIT_OPPORTUNITY_CONTRACT_NAME")
  nominalAmount = this.envVarsHandler.getValueAndCheck("INIT_OPPORTUNITY_CONTRACT_NOMINAL_AMOUNT")
  interestRatePerCent = this.envVarsHandler.getValueAndCheck("INIT_OPPORTUNITY_CONTRACT_INTEREST_PER_CENT")
  interestRatePeriodAdjusted = this.envVarsHandler.getValueAndCheck(
    "INIT_OPPORTUNITY_CONTRACT_INTEREST_PERIOD_ADJUSTED",
  )
  minimalTokenTranche = this.envVarsHandler.getValueAndCheck("INIT_OPPORTUNITY_CONTRACT_MINIMAL_TRANCHE")
  numberOfTotalPayouts = this.envVarsHandler.getValueAndCheck("INIT_OPPORTUNITY_CONTRACT_TOTAL_PAYOUTS")

  async deployContracts() {
    try {
      await this.vaultService.createSecret<VaultWallet>(
        {
          data: {
            address: this.defaultWorkerAddress,
            privateKey: this.defaultWorkerPrivateKey,
          },
        },
        this.defaultWorkerAddressId,
      )
      const wallet = await this.vaultWalletProviderService.getWallet(this.defaultWorkerAddressId)
      const connectedWallet = this.deployContractService.connectWallet(wallet)

      const mngContractAddress = await this.deployContractService.deployManagementContract(connectedWallet)
      this.logger.info(`Management Contract deployed successfully to: ${mngContractAddress}`)
      await this.saveContractAddressToVault(mngContractAddress, this.managamentContractId)

      const subscriptionPeriodDeadline = Date.now() + 14400

      const opportunityAddress = await this.deployContractService.deployAndRegisterOpportunity({
        name: this.contractName,
        interestRate: Number(this.interestRatePerCent),
        minimalTokenTranche: Number(this.minimalTokenTranche),
        nominalAmount: Number(this.nominalAmount),
        numberOfTotalPayouts: Number(this.numberOfTotalPayouts),
        subscriptionPeriodDeadline: subscriptionPeriodDeadline,
        interestRatePeriodAdjusted: Number(this.interestRatePeriodAdjusted),
      })
      this.logger.info(
        `registration of Opportunity contract to Management Contract finished successfully to: ${mngContractAddress}`,
      )
      await this.deployContractService.sendFund(
        {
          address: this.defaultWorkerAddress,
          privateKey: this.defaultWorkerPrivateKey,
        },
        opportunityAddress,
        0.1,
      )
      this.logger.info(`Opportunity contract deployed successfully to: ${opportunityAddress}`)
      await this.saveContractAddressToVault(opportunityAddress, this.opporunityContractId)

      this.logger.info("Deploy contract finished successfully")
    } catch (e) {
      this.logger.error(`Fatal Error deploying contracts: ${e}`)
    }
  }

  async saveContractAddressToVault(address: string, name: string) {
    try {
      await this.vaultService.createSecret<VaultContract>(
        {
          data: {
            address: address,
          },
        },
        name,
      )
    } catch (e) {
      this.logger.error(`Fatal Error saving contract address to vault: ${e}`)
    }
  }
}
