import { NestFactory } from "@nestjs/core"
import { LoggerErrorInterceptor } from "nestjs-pino"
import { ApiModule } from "./Api.Module"

async function main() {
  const app = await NestFactory.create(ApiModule)
  app.useGlobalInterceptors(new LoggerErrorInterceptor())
  app.enableCors()
  await app.listen(process.env.HTTP_PORT ?? 3000)
}

main()
