import { Command, CommandRunner } from "nest-commander"
import { InjectPinoLogger, PinoLogger } from "nestjs-pino"
import { DeploymentService } from "./Deployment.Service"

@Command({ name: "nd-demo-deploy-contracts", options: { isDefault: true } })
export class DeploymentCommand extends CommandRunner {
  constructor(
    @InjectPinoLogger(DeploymentCommand.name) readonly logger: PinoLogger,
    private readonly deploymentService: DeploymentService,
  ) {
    super()
  }

  async run(): Promise<void> {
    await this.deploymentService.deployContracts()
  }
}
