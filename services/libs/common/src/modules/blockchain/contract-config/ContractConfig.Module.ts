import { DynamicModule, Module } from "@nestjs/common"
import { EnvVarsModule } from "../../env-vars-checker/EnvVars.Module"
import { VaultModule } from "../../vault/Vault.Module"
import { ContractConfigInitiator } from "./ContractConfig.Initiator"
import { ContractConfig } from "./ContractConfig.Model"

@Module({})
export class ContractConfigModule {
  static forRootAsync(): DynamicModule {
    return {
      module: ContractConfigInitiator,
      imports: [VaultModule, EnvVarsModule],
      providers: [
        ContractConfigInitiator,
        {
          provide: ContractConfig,
          useFactory: async (contractReadOnlyProvider: ContractConfigInitiator): Promise<ContractConfig> => {
            return await contractReadOnlyProvider.get()
          },
          inject: [ContractConfigInitiator],
        },
      ],
      exports: [ContractConfig],
    }
  }
}
