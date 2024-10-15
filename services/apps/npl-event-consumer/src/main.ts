import { NestFactory } from "@nestjs/core"
import { ConfigService } from "@nestjs/config"
import { LoggerErrorInterceptor } from "nestjs-pino"
import { AppModule } from "./App.Module"
import { MicroserviceOptions, Transport } from "@nestjs/microservices"

async function main() {
  const app = await NestFactory.create(AppModule)
  const configService = app.get(ConfigService)
  const rmqUser = configService.get<string>("RABBITMQ_USER") ?? "admin"
  const rmqPass = configService.get<string>("RABBITMQ_PASS") ?? "adminpass"
  const rmqurl = configService.get<string>("RABBITMQ_URL")
  if (!rmqurl) {
    throw "RABBITMQ_URL is mssing"
  }
  const rabbitMqUrl = `amqp://${rmqUser}:${rmqPass}@${configService.get<string>("RABBITMQ_URL")}`
  app.useGlobalInterceptors(new LoggerErrorInterceptor())
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      queue: configService.get<string>("RABBITMQ_BLOCKCHAIN_EVENT_QUEUE"),
      urls: [rabbitMqUrl],
      noAck: false,
      prefetchCount: 1,
      queueOptions: {
        durable: true,
        deadLetterExchange: "",
        deadLetterRoutingKey: configService.get<string>("RABBITMQ_DLQ"),
        messageTtl: 600000,
      },
    },
  })

  app.startAllMicroservices()
}

main()
