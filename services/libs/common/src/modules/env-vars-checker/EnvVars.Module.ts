import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { EnvVarsHandler } from "./EnvVars.Handler"

@Module({
  imports: [
    ConfigModule.forRoot({
      ignoreEnvFile: process.env.NODE_ENV !== "local",
      envFilePath: [
        `${process.cwd()}/.env.services.common`,
        `${process.cwd()}/.env.services.secrets`,
        `${process.cwd()}/.env.services.url`,
        `${process.cwd()}/.env.services.localhost.url`,
        `${process.cwd()}/.env.services.${process.env.NODE_ENV === "local" ? "local." : ""}${
          process.env.BLOCKCHAIN_NETWORK_NAME
        }`,
      ],
    }),
  ],
  providers: [EnvVarsHandler],
  exports: [EnvVarsHandler],
})
export class EnvVarsModule {}
