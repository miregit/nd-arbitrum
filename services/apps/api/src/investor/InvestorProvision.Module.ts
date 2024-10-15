import { Module } from "@nestjs/common"
import { AuthModule, EngineOpenApiModule, LoggerConfig, UserModule } from "@nd-demo/common"
import { LoggerModule } from "nestjs-pino"
import { InvestorProvisionService } from "./InvestorProvision.service"
import { InvestorProvisionController } from "./InvestorProvision.Controller"

@Module({
  imports: [EngineOpenApiModule.forRootAsync(), LoggerModule.forRootAsync(LoggerConfig), AuthModule, UserModule],
  controllers: [InvestorProvisionController],
  providers: [InvestorProvisionService],
  exports: [InvestorProvisionService],
})
export class investorProvisionModule {}
