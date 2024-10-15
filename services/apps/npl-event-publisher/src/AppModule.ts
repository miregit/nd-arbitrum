import { Module } from "@nestjs/common"
import { LoggerModule } from "nestjs-pino"
import { AuthModule, LoggerConfig, WebModule } from "@nd-demo/common"
import { RabbitModule } from "./modules/rabbit/Rabbit.Module"

@Module({
  imports: [LoggerModule.forRootAsync(LoggerConfig), AuthModule, WebModule, RabbitModule],
})
export class AppModule {}
