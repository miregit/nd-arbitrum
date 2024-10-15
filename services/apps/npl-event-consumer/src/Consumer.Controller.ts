import { Controller } from "@nestjs/common"
import { MessagePattern, RmqContext, Ctx, Payload } from "@nestjs/microservices"
import { ChannelWrapper } from "amqp-connection-manager"
import { PinoLogger, InjectPinoLogger } from "nestjs-pino"
import { protoRefId } from "@nd-demo/common"
import { OpportunityReceiver } from "./Modules/opportunity/Opportunity.Receiver"
import { InvestorHandler } from "./Modules/investor/Investor.Handler"

@Controller()
export class ConsumerController {
  constructor(
    @InjectPinoLogger(ConsumerController.name) readonly logger: PinoLogger,
    private readonly investorHandler: InvestorHandler,
    private readonly opportunityReceiver: OpportunityReceiver,
  ) {}

  @MessagePattern("nd-demo-blockchain-event")
  async handleMessage(@Payload() message: string, @Ctx() context: RmqContext): Promise<void> {
    const data = JSON.parse(message)
    const channel: ChannelWrapper = context.getChannelRef()
    const originalMsg = context.getMessage()
    this.logger.info({ message: data, notification: data.notification.name })

    try {
      channel.ack(originalMsg)
      switch (data.notification.name) {
        case protoRefId.AddNewInvestorNotification:
          await this.investorHandler.RegisterNewInvestorOnChain(data)
          break
        case protoRefId.OpportunityContractDeployment:
        case protoRefId.OpportunityAddInvestor:
        case protoRefId.OpportunityPayInterest:
          await this.opportunityReceiver.handleMessage(data)
          break
        default:
          this.logger.info(`Skipping notification got=${data.notification.name}`)
      }
    } catch (e) {
      this.logger.error(e)
    }
  }
}
