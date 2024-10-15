import { Injectable } from "@nestjs/common"
import { ethers } from "ethers"
import { VaultService } from "../../vault/Vault.Service"
import { EnvVarsHandler } from "../../env-vars-checker/EnvVars.Handler"
import { VaultWalletProviderService } from "../../vault/VaultWalletProvider.Service"
import { InjectPinoLogger, PinoLogger } from "nestjs-pino"
import { VaultContract } from "apps/deploy-contracts/src/deployment/Deployment.Model"
import { ContractConfig } from "../contract-config/ContractConfig.Model"

@Injectable()
export class ContractService {
  private readonly blockChainNetwork: string
  private readonly provider: ethers.Provider
  private readonly managamentContractId: string

  constructor(
    @InjectPinoLogger(ContractService.name) readonly logger: PinoLogger,
    private vaultWalletProviderService: VaultWalletProviderService,
    private vaultService: VaultService,
    private readonly envVarsHandler: EnvVarsHandler,
    readonly contract: ContractConfig,
  ) {
    this.blockChainNetwork = this.envVarsHandler.getValueAndCheck("BLOCKCHAIN_NETWORK")
    this.managamentContractId = this.envVarsHandler.getValueAndCheck("VAULT_MANAGAMENT_CONTRACT_ID")

    this.provider = new ethers.JsonRpcProvider(this.blockChainNetwork)
  }

  async addInvestorToOpportunity(OpportunityContractAddress: string, investorAddress: string): Promise<string> {
    const investorState = await this.contract.opportunityManagement.getInvestorStatus(investorAddress)
    console.dir(investorState)
    const tx = await this.contract.opportunityManagement.registerInvestorToOpportunity(
      investorAddress,
      OpportunityContractAddress,
    )
    const res = await tx.wait()
    return res.blockHash
  }

  async registerNewInvestor(investorAddress: string): Promise<ethers.ContractTransactionReceipt> {
    const tx = await this.contract.opportunityManagement.registerNewInvestor(investorAddress)
    const res = await tx.wait()
    console.dir(res)
    const investorState = await this.contract.opportunityManagement.getInvestorStatus(investorAddress)
    console.dir(investorState)
    return res
  }

  async payInterestForOpportunity(opportunityAddress: string): Promise<ethers.ContractTransactionReceipt> {
    const connectedOpportunityContract = await this.contract.getConnectedOpportunityContract(opportunityAddress)
    const tx = await connectedOpportunityContract.payInterestsToAllHolders()
    const res = await tx.wait()
    return res
  }

  connectWallet(wallet: ethers.Wallet): ethers.Wallet {
    return this.vaultWalletProviderService.connect(wallet, this.provider)
  }
  async getMngContractAddress(): Promise<string> {
    const mngContractAddress = await this.vaultService.getSecret<VaultContract>(this.managamentContractId)
    return mngContractAddress.address
  }
}
