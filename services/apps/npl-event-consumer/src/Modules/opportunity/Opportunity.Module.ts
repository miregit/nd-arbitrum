import { Module } from "@nestjs/common"

import {
  ContractModule,
  DeployContractModule,
  EngineOpenApiModule,
  EnvVarsModule,
  WorkerAccountModule,
} from "@nd-demo/common"
import { OpportunityHandler } from "./Opportunity.Handler"
import { OpportunityReceiver } from "./Opportunity.Receiver"

@Module({
  imports: [
    WorkerAccountModule,
    EngineOpenApiModule.forRootAsync(),
    DeployContractModule,
    EnvVarsModule,
    ContractModule,
  ],
  providers: [OpportunityHandler, OpportunityReceiver],
  exports: [OpportunityHandler, OpportunityReceiver],
})
export class OpportunityModule {}
