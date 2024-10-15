import { Body, Controller, Post, UseGuards, Headers, Get } from "@nestjs/common"
import {
  InvestorListJson,
  JwtGuard,
  JwtService,
  RealmAccessRole,
  RegisterInvestorRequest,
  SystemRoleGuard,
} from "@nd-demo/common"
import { InvestorProvisionService } from "./InvestorProvision.service"

@UseGuards(JwtGuard)
@Controller()
export class InvestorProvisionController {
  constructor(
    private readonly investorProvisionService: InvestorProvisionService,
    private readonly jwtService: JwtService,
  ) {}

  @Post("/api/v1/admin/investors/register/new/")
  @RealmAccessRole("admin")
  @UseGuards(SystemRoleGuard)
  async createInvestorRequest(
    @Body() body: RegisterInvestorRequest,
    @Headers("Authorization") bearer: string,
  ): Promise<string> {
    const jwt = this.jwtService.decodeJwt(bearer)
    return await this.investorProvisionService.createInvestorRequest(body, jwt)
  }

  @Get("/api/v1/admin/investors/")
  @RealmAccessRole("admin")
  @UseGuards(SystemRoleGuard)
  async getAllInvestors(@Headers("Authorization") bearer: string): Promise<InvestorListJson> {
    const jwt = this.jwtService.decodeJwt(bearer)
    return await this.investorProvisionService.getAllinvestors(jwt)
  }
}
