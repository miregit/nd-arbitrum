import { Body, Controller, Get, Headers, Post, Query, UseGuards } from "@nestjs/common"
import {
  AddInvestorToOpportunityWhitelistRequest,
  CreateOpportunityRequest,
  JwtGuard,
  JwtService,
  OpportunityListJson,
  RealmAccessRole,
  SendInterestPayForOpportunityRequest,
  SystemRoleGuard,
} from "@nd-demo/common"
import { OpportunityService } from "./Opportunity.service"

@UseGuards(JwtGuard)
@Controller()
export class OpportunityController {
  constructor(private readonly opportunityService: OpportunityService, private readonly jwtService: JwtService) {}

  @Post("/api/v1/admin/opportunities/new/")
  @RealmAccessRole("admin")
  @UseGuards(SystemRoleGuard)
  async createOpportunityRequest(
    @Body() body: CreateOpportunityRequest,
    @Headers("Authorization") bearer: string,
    @Query("overrideDeadline") overrideDeadline: string,
  ): Promise<string> {
    const jwt = this.jwtService.decodeJwt(bearer)
    return await this.opportunityService.createOpportunityRequest(body, overrideDeadline === "true", jwt)
  }

  @Post("/api/v1/admin/opportunities/whitelist/add")
  @RealmAccessRole("admin")
  @UseGuards(SystemRoleGuard)
  async addInvestorToOpportunityWhitelist(
    @Body() body: AddInvestorToOpportunityWhitelistRequest,
    @Headers("Authorization") bearer: string,
  ): Promise<string> {
    const jwt = this.jwtService.decodeJwt(bearer)
    return await this.opportunityService.addInvestorToOpportunityWhitelist(
      body.OpportunityId,
      body.InvestorWalletAddress,
      jwt,
    )
  }

  @Post("/api/v1/admin/opportunities/pay/interest")
  @RealmAccessRole("admin")
  @UseGuards(SystemRoleGuard)
  async sendInterestPayOnOpportunity(
    @Body() body: SendInterestPayForOpportunityRequest,
    @Headers("Authorization") bearer: string,
    @Query("overrideInterestPaymentSchedule") overrideInterestPaymentSchedule: string,
  ): Promise<string> {
    const jwt = this.jwtService.decodeJwt(bearer)
    return await this.opportunityService.sendInterestPayForOpportunity(
      body.OpportunityId,
      overrideInterestPaymentSchedule === "true",
      jwt,
    )
  }

  @Get("/api/v1/opportunities/")
  async getAllOpportunities(@Headers("Authorization") bearer: string): Promise<OpportunityListJson> {
    const jwt = this.jwtService.decodeJwt(bearer)
    return await this.opportunityService.getAllOpportunities(jwt)
  }
}
