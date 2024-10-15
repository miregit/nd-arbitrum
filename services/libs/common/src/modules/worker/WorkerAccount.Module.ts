import { Module } from "@nestjs/common"
import { AuthModule, EnvVarsModule, VaultModule } from "@nd-demo/common"
import { WorkerAccountService } from "./WorkerAccount.Service"
import { UserModule } from "../user/User.Module"

@Module({
  imports: [EnvVarsModule, AuthModule, VaultModule, UserModule],
  providers: [WorkerAccountService],
  exports: [WorkerAccountService],
})
export class WorkerAccountModule {}
