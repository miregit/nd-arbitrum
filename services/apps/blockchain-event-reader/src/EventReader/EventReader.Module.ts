import { Module } from "@nestjs/common"
import { LoggerModule } from "nestjs-pino"
import {
  ContractConfigModule,
  EngineOpenApiModule,
  EnvVarsModule,
  LoggerConfig,
  TransactionLogDatabaseModule,
  WorkerAccountModule,
} from "@nd-demo/common"
import { EventReaderService } from "./EventReader.Service"

@Module({
  imports: [
    EngineOpenApiModule.forRootAsync(),
    LoggerModule.forRootAsync(LoggerConfig),
    ContractConfigModule.forRootAsync(),
    EnvVarsModule,
    TransactionLogDatabaseModule,
    WorkerAccountModule,
  ],
  controllers: [],
  providers: [EventReaderService],
})
export class EventReaderModule {}
