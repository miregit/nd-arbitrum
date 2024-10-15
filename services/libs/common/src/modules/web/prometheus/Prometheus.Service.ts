import { Injectable } from "@nestjs/common"
import { InjectPinoLogger, PinoLogger } from "nestjs-pino"
import { Summary } from "prom-client"

@Injectable()
export class PrometheusService {
  constructor(@InjectPinoLogger(PrometheusService.name) readonly logger: PinoLogger) {}

  summeryrequest: Summary<"labelNames"> = this.SummeryCreaction()

  private SummeryCreaction() {
    return new Summary({
      name: "nd_api_http",
      help: "Duration of HTTP request in seconds",
      percentiles: [0.5, 0.9, 0.99],
      labelNames: ["labelNames"],
    })
  }

  measureHttpRequest(label: string) {
    const labels = {
      labelNames: label,
    }
    return this.measureStart(this.summeryrequest, labels)
  }

  private measureStart(summary, labels) {
    return summary.startTimer(labels)
  }
}
