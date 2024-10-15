import { Inject, Injectable } from "@nestjs/common"
import { ClientProxy } from "@nestjs/microservices"
import { PinoLogger, InjectPinoLogger } from "nestjs-pino"
import { lastValueFrom } from "rxjs"
import { EventSourceMessage } from "../sse/SSE.Model"
import { EnvVarsHandler } from "@nd-demo/common"

@Injectable()
export class RabbitService {
  constructor(
    @Inject("RABBITMQ_BLOCKCHAIN_EVENT_QUEUE") private blockchainClientProxy: ClientProxy,
    private envVarsHandler: EnvVarsHandler,
    @InjectPinoLogger(RabbitService.name) readonly logger: PinoLogger,
  ) {}

  private readonly blockchainEventQueue = this.envVarsHandler.getValueAndCheck("RABBITMQ_BLOCKCHAIN_EVENT_QUEUE")

  async publishEvent(message: EventSourceMessage): Promise<void> {
    this.logger.info(message.data)
    try {
      await this.emit(this.blockchainEventQueue, message.data, this.blockchainClientProxy)
    } catch (e) {
      console.dir(e)
    }
  }

  async emit(pattern: string, data: string, clientProxy: ClientProxy): Promise<void> {
    return await lastValueFrom(clientProxy.emit(pattern, data))
  }
}
