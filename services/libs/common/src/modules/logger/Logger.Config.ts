import pino from "pino"
import ecsFormat from "@elastic/ecs-pino-format"
import { EnvVarsModule } from "../env-vars-checker/EnvVars.Module"
import { EnvVarsHandler } from "../env-vars-checker/EnvVars.Handler"

export const LoggerConfig = {
  imports: [EnvVarsModule],
  inject: [EnvVarsHandler],
  useFactory: (config: EnvVarsHandler) => {
    return {
      pinoHttp: {
        logger: pino(ecsFormat({ convertReqRes: true, apmIntegration: true, convertErr: true })),
        level: config.getValueAndCheck("LOG_LEVEL") ?? "info",
        transport: process.env.NODE_ENV !== "production" ? { target: "pino-pretty" } : undefined,
      },
    }
  },
}
