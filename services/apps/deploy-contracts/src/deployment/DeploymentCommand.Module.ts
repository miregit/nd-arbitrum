import { Module } from "@nestjs/common"
import { LoggerModule } from "nestjs-pino"
import { DeploymentService } from "./Deployment.Service"
import { DeploymentCommand } from "./Deployment.Command"
import { DeployContractModule, EnvVarsModule, LoggerConfig, VaultModule } from "@nd-demo/common"

@Module({
  imports: [LoggerModule.forRootAsync(LoggerConfig), DeployContractModule, VaultModule, EnvVarsModule],
  providers: [DeploymentService, DeploymentCommand],
  exports: [],
})
export class DeploymentCommandModule {}
