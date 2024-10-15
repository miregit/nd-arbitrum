import { Module } from "@nestjs/common"
import { LoggerModule } from "nestjs-pino"
import { SSETransporter } from "./SSE.Transporter"
import { AuthModule, EnvVarsModule, LoggerConfig, WebModule } from "@nd-demo/common"

@Module({
  imports: [LoggerModule.forRootAsync(LoggerConfig), WebModule, AuthModule, EnvVarsModule],
  controllers: [],
  providers: [SSETransporter],
  exports: [SSETransporter],
})
export class SSEModule {}
