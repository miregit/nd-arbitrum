import { Module } from "@nestjs/common"
import { AuthModule, EngineModule, UserModule, VaultModule } from "@nd-demo/common"
import { UserAuthController } from "./UserAuth.Controller"
import { UserAuthService } from "./UserAuth.Service"

@Module({
  imports: [AuthModule, UserModule, EngineModule, VaultModule],
  controllers: [UserAuthController],
  providers: [UserAuthService],
  exports: [],
})
export class UserAuthModule {}
