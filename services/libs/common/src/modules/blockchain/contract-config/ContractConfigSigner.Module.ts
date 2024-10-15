import { DynamicModule, Module } from "@nestjs/common"
import { EnvVarsModule } from "../../env-vars-checker/EnvVars.Module"
import { VaultModule } from "../../vault/Vault.Module"
import { ContractConfig } from "./ContractConfig.Model"
import { ContractConfigSignerInitiator } from "./ContractConfigSigner.Initiator"

@Module({})
export class ContractConfigSignerModule {
  static forRootAsync(): DynamicModule {
    return {
      module: ContractConfigSignerInitiator,
      imports: [VaultModule, EnvVarsModule],
      providers: [
        ContractConfigSignerInitiator,
        {
          provide: ContractConfig,
          useFactory: async (contractSignerProvider: ContractConfigSignerInitiator): Promise<ContractConfig> => {
            return await contractSignerProvider.get()
          },
          inject: [ContractConfigSignerInitiator],
        },
      ],
      exports: [ContractConfig],
    }
  }
}
