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

@Injectable()
export class ContractConfigInitiator {
  constructor(readonly vaultService: VaultService, readonly envVarsHandler: EnvVarsHandler) {}

  async get(): Promise<ContractConfig> {
    const managamentContractId = this.envVarsHandler.getValueAndCheck("VAULT_MANAGAMENT_CONTRACT_ID")
    const blockchainNetwork = this.envVarsHandler.getValueAndCheck("BLOCKCHAIN_WSS_NETWORK")

    const provider = new ethers.WebSocketProvider(blockchainNetwork)
    const mngContract = await this.vaultService.getSecret<VaultContract>(managamentContractId)

    return {
      opportunityManagement: CONTROL_MANAGEMENT__factory.connect(mngContract.address, provider),
      opportunityManagementAddress: mngContract.address,
      confirmationBlocks: 2,
      getConnectedOpportunityContract: (OpportunityContractAddress: string): OpportunityContract => {
        return OpportunityContract__factory.connect(OpportunityContractAddress, provider)
      },
    }
  }
}
