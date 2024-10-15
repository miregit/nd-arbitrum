import { CONTROL_MANAGEMENT, OpportunityContract } from "@nd-demo/common/hardhat-generated-resources/typechain-types"
import { Injectable } from "@nestjs/common"

@Injectable()
export class ContractConfig {
  public opportunityManagement: CONTROL_MANAGEMENT
  public opportunityManagementAddress: string
  public confirmationBlocks: number
  public getConnectedOpportunityContract: (OpportunityContractAddress: string) => OpportunityContract
}
