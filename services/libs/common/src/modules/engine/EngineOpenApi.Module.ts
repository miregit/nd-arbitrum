import { DynamicModule, Module } from "@nestjs/common"
import { EngineOpenApiConfigModule } from "./EngineOpenApi.Config.Module"
import { EnvVarsModule } from "../env-vars-checker/EnvVars.Module"
import { EngineOpenApiConfig } from "./EngineOpenApi.Model"

@Module({})
export class EngineOpenApiModule {
  static forRootAsync(): DynamicModule {
    return {
      module: EngineOpenApiConfigModule,
      imports: [EnvVarsModule],
      providers: [
        EngineOpenApiConfigModule,
        {
          provide: EngineOpenApiConfig,
          useFactory: (engineOpenApiConfigModule: EngineOpenApiConfigModule): EngineOpenApiConfig => {
            return engineOpenApiConfigModule.get()
          },
          inject: [EngineOpenApiConfigModule],
        },
      ],
      exports: [EngineOpenApiConfig],
    }
  }
}
