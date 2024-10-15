import { NestFactory } from "@nestjs/core"
import { AppModule } from "./AppModule"
import { SSEModule } from "./modules/sse/SSE.Module"
import { SSETransporter } from "./modules/sse/SSE.Transporter"

async function main() {
  const sseModule = await NestFactory.createApplicationContext(SSEModule)
  const sseTransporter = sseModule.get(SSETransporter)
  const microservice = await NestFactory.createMicroservice(AppModule, {
    strategy: sseTransporter,
  })

  microservice.listen()
}

main()
