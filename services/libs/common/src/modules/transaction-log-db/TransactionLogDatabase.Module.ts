import { Module } from "@nestjs/common"
import { LoggerModule } from "nestjs-pino"
import { EnvVarsHandler, EnvVarsModule, LoggerConfig } from "@nd-demo/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { TransactionLogDatabaseService } from "./TransactionLogDatabase.Service"
import { TransferEvent } from "./TransferEvent.Entity"

@Module({
  imports: [
    LoggerModule.forRootAsync(LoggerConfig),
    EnvVarsModule,
    TypeOrmModule.forRootAsync({
      imports: [EnvVarsModule],
      inject: [EnvVarsHandler],
      useFactory: (envVarsHandler: EnvVarsHandler) => ({
        type: "postgres",
        url: envVarsHandler.getValueAndCheck("BLOCKCHAIN_EVENTS_DB_URL"),
        entities: [TransferEvent],
        synchronize: envVarsHandler.getValueAndCheck("IS_PROD") === "false",
      }),
    }),
    TypeOrmModule.forFeature([TransferEvent]),
  ],
  providers: [TransactionLogDatabaseService],
  exports: [TransactionLogDatabaseService],
})
export class TransactionLogDatabaseModule {}
