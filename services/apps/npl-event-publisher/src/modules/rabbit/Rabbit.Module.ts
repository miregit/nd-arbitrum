import { Module } from "@nestjs/common"
import { ClientsModule, Transport } from "@nestjs/microservices"
import { RabbitController } from "./Rabbit.Controller"
import { RabbitService } from "./Rabbit.Service"
import { EnvVarsHandler, EnvVarsModule } from "@nd-demo/common"

@Module({
  imports: [
    EnvVarsModule,
    ClientsModule.registerAsync([
      {
        name: "RABBITMQ_BLOCKCHAIN_EVENT_QUEUE",
        imports: [EnvVarsModule],
        useFactory: (envVarsHandler: EnvVarsHandler) => ({
          transport: Transport.RMQ,
          options: {
            queue: envVarsHandler.getValueAndCheck("RABBITMQ_BLOCKCHAIN_EVENT_QUEUE"),
            urls: [
              `amqp://${envVarsHandler.getValueAndCheck("RABBITMQ_USER")}:${envVarsHandler.getValueAndCheck(
                "RABBITMQ_PASS",
              )}@${envVarsHandler.getValueAndCheck("RABBITMQ_URL")}`,
            ],
            noAck: false,
            prefetchCount: 1,
            queueOptions: {
              durable: true,
              deadLetterExchange: "",
              deadLetterRoutingKey: envVarsHandler.getValueAndCheck("RABBITMQ_DLQ"),
              messageTtl: 600000,
            },
          },
        }),
        inject: [EnvVarsHandler],
      },
    ]),
  ],
  controllers: [RabbitController],
  providers: [RabbitService],
})
export class RabbitModule {}
