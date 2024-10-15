import { Module } from "@nestjs/common"
import { WebModule } from "../web/Web.Module"
import { EngineService } from "./Engine.Service"
import { EnvVarsModule } from "../env-vars-checker/EnvVars.Module"

@Module({
  imports: [WebModule, EnvVarsModule],
  providers: [EngineService],
  exports: [EngineService],
})
export class EngineModule {}
