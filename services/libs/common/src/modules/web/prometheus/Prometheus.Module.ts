import { Module } from "@nestjs/common"
import { PrometheusService } from "./Prometheus.Service"

@Module({
  imports: [],
  providers: [PrometheusService],
  exports: [PrometheusService],
})
export class PrometheusModule {}
