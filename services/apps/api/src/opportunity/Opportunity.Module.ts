import { Module } from "@nestjs/common"
import { AuthModule, EngineOpenApiModule, LoggerConfig } from "@nd-demo/common"
import { LoggerModule } from "nestjs-pino"
import { OpportunityService } from "./Opportunity.service"
import { OpportunityController } from "./Opportunity.Controller"

@Module({
  imports: [EngineOpenApiModule.forRootAsync(), LoggerModule.forRootAsync(LoggerConfig), AuthModule],
  controllers: [OpportunityController],
  providers: [OpportunityService],
  exports: [OpportunityService],
})
export class OpportunityModule {}
