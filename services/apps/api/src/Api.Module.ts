import { MiddlewareConsumer, Module, NestModule, RequestMethod } from "@nestjs/common"
import { LoggerModule } from "nestjs-pino"
import { EnvVarsModule, LoggerConfig, PrometheusMiddleware, PrometheusModule, UserModule } from "@nd-demo/common"
import { UserAuthModule } from "./auth/UserAuth.Module"
import { investorProvisionModule } from "./investor/InvestorProvision.Module"
import { OpportunityModule } from "./opportunity/Opportunity.Module"
@Module({
  imports: [
    LoggerModule.forRootAsync(LoggerConfig),
    EnvVarsModule,
    PrometheusModule,
    UserModule,
    UserAuthModule,
    investorProvisionModule,
    OpportunityModule,
  ],
  providers: [],
})
export class ApiModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(PrometheusMiddleware).forRoutes({ path: "*", method: RequestMethod.ALL })
  }
}
