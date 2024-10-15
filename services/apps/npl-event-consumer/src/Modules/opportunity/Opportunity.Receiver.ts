import { InjectPinoLogger, PinoLogger } from "nestjs-pino"
import { OpportunityHandler } from "./Opportunity.Handler"
import { Injectable } from "@nestjs/common"
import {
  AddInvestorToOpportunityNotificationProtocolStream,
  OpportunityDeployNotificationProtocolStream,
  OpportunityStream,
  PayInterestForOpportunityNotificationProtocolStream,
} from "./Opportunity.Model"
import { protoRefId } from "@nd-demo/common"

Injectable()
export class OpportunityReceiver {
  constructor(
    private readonly opportunityHandler: OpportunityHandler,
    @InjectPinoLogger(OpportunityReceiver.name) readonly logger: PinoLogger,
  ) {}

  handleMessage = async (data: OpportunityStream) => {
    switch (data.notification.name) {
      case protoRefId.OpportunityContractDeployment:
        await this.opportunityHandler.deployNewOpportunityOnChain(data as OpportunityDeployNotificationProtocolStream)
        return
      case protoRefId.OpportunityAddInvestor:
        await this.opportunityHandler.AddInvestorToOpportunityOnChain(
          data as AddInvestorToOpportunityNotificationProtocolStream,
        )
        return
      case protoRefId.OpportunityPayInterest:
        await this.opportunityHandler.payInterestOpportunityOnChain(
          data as PayInterestForOpportunityNotificationProtocolStream,
        )
        return
      default:
        this.logger.info(`Skipping notification got=${data.notification.name}`)
    }
  }
}
