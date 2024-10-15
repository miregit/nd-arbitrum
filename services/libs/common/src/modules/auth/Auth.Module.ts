import { Module } from "@nestjs/common"
import { WebModule } from "../web/Web.Module"
import { JwtService } from "./Jwt.Service"
import { KeycloakService } from "./Keycloak.Service"
import { EnvVarsModule } from "../env-vars-checker/EnvVars.Module"
import { VaultModule } from "../vault/Vault.Module"
import { AdminClientService } from "./AdminClient.Service"

@Module({
  imports: [WebModule, EnvVarsModule, VaultModule],
  providers: [JwtService, KeycloakService, AdminClientService],
  exports: [JwtService, KeycloakService, AdminClientService],
})
export class AuthModule {}
