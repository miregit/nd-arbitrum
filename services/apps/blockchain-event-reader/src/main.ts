import { NestFactory } from "@nestjs/core"
import { EventReaderModule } from "./EventReader/EventReader.Module"
import { EventReaderService } from "./EventReader/EventReader.Service"

async function main() {
  const app = await NestFactory.createApplicationContext(EventReaderModule)
  const transferListenerService = app.get(EventReaderService)

  transferListenerService.listenToEvents()
}

main()
