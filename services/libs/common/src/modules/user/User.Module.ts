import { Module } from "@nestjs/common"
import { UserService } from "./User.Service"
import { AuthModule } from "../auth/Auth.Module"
import { EngineModule } from "../engine/Engine.Module"
import { VaultModule } from "../vault/Vault.Module"

@Module({
  imports: [AuthModule, EngineModule, VaultModule],
  controllers: [],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
