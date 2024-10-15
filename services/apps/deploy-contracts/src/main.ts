import { Logger } from "@nestjs/common"
import { CommandFactory } from "nest-commander"
import { DeploymentCommandModule } from "./deployment/DeploymentCommand.Module"

async function main() {
  await CommandFactory.run(DeploymentCommandModule, new Logger())
}

main()
