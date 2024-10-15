import { Module } from "@nestjs/common"

import { ContractModule, EngineOpenApiModule, EnvVarsModule, WorkerAccountModule } from "@nd-demo/common"
import { InvestorHandler } from "./Investor.Handler"

@Module({
  imports: [WorkerAccountModule, EngineOpenApiModule.forRootAsync(), ContractModule, EnvVarsModule],
  providers: [InvestorHandler],
  exports: [InvestorHandler],
})
export class InvestorModule {}
