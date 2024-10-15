import { Controller } from "@nestjs/common"
import { MessagePattern } from "@nestjs/microservices"
import { RabbitService } from "./Rabbit.Service"
import { EventSourceMessage } from "../sse/SSE.Model"

@Controller()
export class RabbitController {
  constructor(private readonly rabbitService: RabbitService) {}

  @MessagePattern("publish")
  async publishEvent(m: EventSourceMessage): Promise<void> {
    await this.rabbitService.publishEvent(m)
  }
}
