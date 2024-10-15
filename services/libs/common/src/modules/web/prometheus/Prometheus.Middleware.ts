import { NestMiddleware } from "@nestjs/common"
import { NextFunction, Request, Response } from "express"
import { InjectPinoLogger, PinoLogger } from "nestjs-pino"
import { PrometheusService } from "./Prometheus.Service"

export class PrometheusMiddleware implements NestMiddleware {
  constructor(
    private promService: PrometheusService,
    @InjectPinoLogger(PrometheusService.name) readonly logger: PinoLogger,
  ) {}

  async use(req: Request, _: Response, next: NextFunction) {
    const endCapture = await this.promService.measureHttpRequest(req.path)
    next()
    endCapture()
  }
}
