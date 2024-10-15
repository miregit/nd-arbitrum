import { Module } from "@nestjs/common"
import { LoggerModule } from "nestjs-pino"
import { LoggerConfig } from "../../logger/Logger.Config"
import { EnvVarsModule } from "../../env-vars-checker/EnvVars.Module"
import { WebModule } from "../../web/Web.Module"
import { VaultModule } from "../../vault/Vault.Module"
import { ContractService } from "./Contract.Service"
import { ContractConfigSignerModule } from "../contract-config/ContractConfigSigner.Module"

@Module({
  imports: [
    LoggerModule.forRootAsync(LoggerConfig),
    EnvVarsModule,
    WebModule,
    VaultModule,
    ContractConfigSignerModule.forRootAsync(),
  ],
  providers: [ContractService],
  exports: [ContractService],
})
export class ContractModule {}
