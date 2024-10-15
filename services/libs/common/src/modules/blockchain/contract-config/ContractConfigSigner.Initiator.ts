import { Injectable } from "@nestjs/common"
import { VaultService } from "../../vault/Vault.Service"
import { EnvVarsHandler } from "../../env-vars-checker/EnvVars.Handler"
import { ContractConfig } from "./ContractConfig.Model"
import { ethers } from "ethers"
import { VaultContract } from "apps/deploy-contracts/src/deployment/Deployment.Model"
import {
  CONTROL_MANAGEMENT__factory,
  OpportunityContract,
  OpportunityContract__factory,
} from "@nd-demo/common/hardhat-generated-resources/typechain-types"
import { VaultWallet } from "../../vault/Vault.Model"
import { VaultWalletProviderService } from "../../vault/VaultWalletProvider.Service"

@Injectable()
export class ContractConfigSignerInitiator {
  constructor(
    readonly vaultService: VaultService,
    readonly vaultWalletProviderService: VaultWalletProviderService,
    readonly envVarsHandler: EnvVarsHandler,
  ) {}

  async get(): Promise<ContractConfig> {
    const managamentContractId = this.envVarsHandler.getValueAndCheck("VAULT_MANAGAMENT_CONTRACT_ID")
    const blockchainNetwork = this.envVarsHandler.getValueAndCheck("BLOCKCHAIN_NETWORK")
    const defaultWorkerAddressId = this.envVarsHandler.getValueAndCheck("VAULT_WORKER_ID")

    const provider = new ethers.JsonRpcProvider(blockchainNetwork)
    const mngContract = await this.vaultService.getSecret<VaultContract>(managamentContractId)
    const workerWallet = await this.vaultService.getSecret<VaultWallet>(defaultWorkerAddressId)
    const workerSigner = new ethers.Wallet(workerWallet.privateKey)
    const connectedWallet = await this.vaultWalletProviderService.connect(workerSigner, provider)

    return {
      opportunityManagement: CONTROL_MANAGEMENT__factory.connect(mngContract.address, connectedWallet),
      opportunityManagementAddress: mngContract.address,
      confirmationBlocks: 2,
      getConnectedOpportunityContract: (OpportunityContractAddress: string): OpportunityContract => {
        return OpportunityContract__factory.connect(OpportunityContractAddress, connectedWallet)
      },
    }
  }
}
