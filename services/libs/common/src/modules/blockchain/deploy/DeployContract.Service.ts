import { Injectable } from "@nestjs/common"
import { InjectPinoLogger, PinoLogger } from "nestjs-pino"
import { Provider, ethers } from "ethers"
import { EnvVarsHandler } from "../../env-vars-checker/EnvVars.Handler"
import { VaultWalletProviderService } from "../../vault/VaultWalletProvider.Service"
import {
  CONTROL_MANAGEMENT,
  CONTROL_MANAGEMENT__factory,
  OpportunityContract__factory,
} from "@nd-demo/common/hardhat-generated-resources/typechain-types"
import { FaucetWallet, OpportunityDeployJson } from "./DeployContract.Model"
import { VaultService } from "../../vault/Vault.Service"
import { VaultContract } from "apps/deploy-contracts/src/deployment/Deployment.Model"
import { error } from "console"

@Injectable()
export class DeployContractService {
  private readonly blockChainNetwork: string
  private readonly managamentContractId: string
  private readonly provider: Provider
  private readonly defaultWorkerAddressId: string

  constructor(
    @InjectPinoLogger(DeployContractService.name) readonly logger: PinoLogger,
    private vaultWalletProviderService: VaultWalletProviderService,
    private vaultService: VaultService,
    private readonly envVarsHandler: EnvVarsHandler,
  ) {
    this.blockChainNetwork = this.envVarsHandler.getValueAndCheck("BLOCKCHAIN_NETWORK")
    this.managamentContractId = this.envVarsHandler.getValueAndCheck("VAULT_MANAGAMENT_CONTRACT_ID")
    this.defaultWorkerAddressId = this.envVarsHandler.getValueAndCheck("VAULT_WORKER_ID")
    this.provider = new ethers.JsonRpcProvider(this.blockChainNetwork)
  }

  connectWallet(wallet: ethers.Wallet): ethers.Wallet {
    return this.vaultWalletProviderService.connect(wallet, this.provider)
  }

  async deployOpportunityContract(
    wallet: ethers.Wallet,
    contractName: string,
    contractSymbol: string,
    nominalAmount: number,
    interestRatePerCent: number,
    minimalTokenTranche: number,
    numberOfTotalPayouts: number,
    subscriptionPeriodDeadline: number,
    interestRatePeriodAdjusted: number,
    managementContractAddress: string,
  ): Promise<string> {
    const metadata = OpportunityContract__factory.abi
    const abiByteCode = OpportunityContract__factory.bytecode
    const factory = new ethers.ContractFactory(metadata, abiByteCode, wallet)
    const contract = await factory.deploy(
      contractName,
      contractSymbol,
      ethers.parseEther(nominalAmount.toString()),
      ethers.parseEther(interestRatePerCent.toString()),
      ethers.parseEther(minimalTokenTranche.toString()),
      numberOfTotalPayouts,
      subscriptionPeriodDeadline,
      ethers.parseEther(interestRatePeriodAdjusted.toString()),
      managementContractAddress,
    )
    const address = await contract.getAddress()
    this.logger.info(`Opportunity Contract ${contractName} to ${address}`)
    return address
  }

  async deployManagementContract(wallet: ethers.Wallet): Promise<string> {
    const metadata = CONTROL_MANAGEMENT__factory.abi
    const abiByteCode = CONTROL_MANAGEMENT__factory.bytecode
    const factory = new ethers.ContractFactory(metadata, abiByteCode, wallet)
    const contract = await factory.deploy()
    const CONTROL_MANAGEMENTContract = contract as CONTROL_MANAGEMENT
    await (await CONTROL_MANAGEMENTContract.initialize()).wait()
    return await contract.getAddress()
  }

  async registerOpportunityContract(
    wallet: ethers.Wallet,
    contractName: string,
    opportunityContractAddress: string,
    managementContractAddress: string,
  ): Promise<string> {
    const managementContract = CONTROL_MANAGEMENT__factory.connect(managementContractAddress, wallet)
    const res = await managementContract.registerNewOpportunity(
      ethers.encodeBytes32String(contractName),
      opportunityContractAddress,
    )
    await res.wait()
    return res.hash
  }

  async sendFund(faucet: FaucetWallet, toAddress: string, amount: number): Promise<void> {
    this.logger.info(`Sending ${amount} to ${toAddress}...`)
    const provider = new ethers.JsonRpcProvider(this.blockChainNetwork)
    const wallet = new ethers.Wallet(faucet.privateKey, provider)
    const tx = await wallet.sendTransaction({
      to: toAddress,
      value: ethers.parseEther(amount.toString()),
    })
    await tx.wait()

    this.logger.info(`${amount} was sent to ${toAddress} success`)
  }

  async deployAndRegisterOpportunity(data: OpportunityDeployJson): Promise<string> {
    try {
      const wallet = await this.vaultWalletProviderService.getWallet(this.defaultWorkerAddressId)
      const contractSymbol = this.envVarsHandler.getValueAndCheck("INIT_OPPORTUNITY_CONTRACT_SYMBOL")
      const connectedWallet = this.connectWallet(wallet)
      const mngContractAddress = await this.getMngContractAddress()
      const opportunityAddress = await this.deployOpportunityContract(
        connectedWallet,
        data.name,
        contractSymbol,
        data.nominalAmount,
        data.interestRate,
        data.minimalTokenTranche,
        data.numberOfTotalPayouts,
        data.subscriptionPeriodDeadline,
        data.interestRatePeriodAdjusted,
        mngContractAddress,
      )
      this.logger.info(
        `register ${data.name} on address ${opportunityAddress} to management contract ${mngContractAddress}`,
      )
      await this.registerOpportunityContract(connectedWallet, data.name, opportunityAddress, mngContractAddress)
      this.logger.info(`Opportunity ${data.name} registered successfully`)
      return opportunityAddress
    } catch (e) {
      this.logger.error(e)
      throw error(e)
    }
  }

  async getMngContractAddress(): Promise<string> {
    const mngContractAddress = await this.vaultService.getSecret<VaultContract>(this.managamentContractId)
    return mngContractAddress.address
  }
}
