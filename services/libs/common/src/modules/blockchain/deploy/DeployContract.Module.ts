import { Module } from "@nestjs/common"
import { LoggerModule } from "nestjs-pino"
import { DeployContractService } from "./DeployContract.Service"
import { LoggerConfig } from "../../logger/Logger.Config"
import { EnvVarsModule } from "../../env-vars-checker/EnvVars.Module"
import { WebModule } from "../../web/Web.Module"
import { VaultModule } from "../../vault/Vault.Module"

@Module({
  imports: [LoggerModule.forRootAsync(LoggerConfig), EnvVarsModule, WebModule, VaultModule],
  providers: [DeployContractService],
  exports: [DeployContractService],
})
export class DeployContractModule {}
