import { Module } from "@nestjs/common"
import { LoggerModule } from "nestjs-pino"
import { ConsumerController } from "./Consumer.Controller"
import { EnvVarsModule, LoggerConfig } from "@nd-demo/common"
import { InvestorModule } from "./Modules/investor/Investor.Module"
import { OpportunityModule } from "./Modules/opportunity/Opportunity.Module"
@Module({
  imports: [LoggerModule.forRootAsync(LoggerConfig), EnvVarsModule, InvestorModule, OpportunityModule],
  controllers: [ConsumerController],
})
export class AppModule {}
