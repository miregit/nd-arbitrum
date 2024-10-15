import { Module } from "@nestjs/common"
import { WebModule } from "../web/Web.Module"
import { VaultService } from "./Vault.Service"
import { EnvVarsModule } from "../env-vars-checker/EnvVars.Module"
import { VaultWalletProviderService } from "./VaultWalletProvider.Service"

@Module({
  imports: [WebModule, EnvVarsModule],
  providers: [VaultService, VaultWalletProviderService],
  exports: [VaultService, VaultWalletProviderService],
})
export class VaultModule {}
