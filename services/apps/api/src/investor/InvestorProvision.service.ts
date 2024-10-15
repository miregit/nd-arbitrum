import {
  AdminClaims,
  AdminClientService,
  EngineOpenApiConfig,
  InvestorListJson,
  JwtClaim,
  UserService,
  WorkerClaims,
} from "@nd-demo/common"
import { Injectable } from "@nestjs/common"
import { InjectPinoLogger, PinoLogger } from "nestjs-pino"
import { InvestorCreation } from "./InvestorProvision.Model"
import { InvestorsListMapper } from "./InvestorProvision.Mapper"

@Injectable()
export class InvestorProvisionService {
  constructor(
    @InjectPinoLogger(InvestorProvisionService.name) readonly logger: PinoLogger,
    private readonly engineOpenApiConfig: EngineOpenApiConfig,
    private readonly userService: UserService,
    private readonly adminClientService: AdminClientService,
  ) {}
  async createInvestorRequest(args: InvestorCreation, jwt: JwtClaim): Promise<string> {
    const { name, emailAddress, company, password, walletAddress } = args
    const clientAdminToken = await this.adminClientService.getAdminClientAccessToken()
    const keycloakRes = await this.createKeycloakUser(name, emailAddress, password, clientAdminToken.access_token)
    const header = this.engineOpenApiConfig.getHeaders(jwt.token)
    const platformRes = await this.engineOpenApiConfig.engineOpenApi.createInvestorProvisionRequest(
      {
        name: name,
        companyName: company,
        emailAddress: emailAddress,
        addedBy: jwt.preferred_username,
        WalletAddress: walletAddress,
        ssid: keycloakRes,
        "@parties": {
          admin: {
            entity: { ...AdminClaims },
            access: {},
          },
          investor: {
            entity: { company: [company] },
            access: {},
          },
          worker: {
            entity: { ...WorkerClaims },
            access: {},
          },
        },
      },
      undefined,
      undefined,
      header,
    )
    await this.engineOpenApiConfig.engineOpenApi.investorProvisionRequestSendBlockchainProvisonRequest(
      platformRes.data["@id"],
      undefined,
      undefined,
      header,
    )
    return platformRes.data.WalletAddress
  }

  async createKeycloakUser(
    name: string,
    emailAddress: string,
    password: string,
    jwt: string,
    keycloakRole = "investor",
  ) {
    return await this.userService.createKeycloakUser(
      {
        fullname: name,
        emailAddress,
        attributes: {},
        role: keycloakRole,
        password: password,
        isEmailVerified: true,
      },
      jwt,
    )
  }

  async getAllinvestors(jwt: JwtClaim): Promise<InvestorListJson> {
    const header = this.engineOpenApiConfig.getHeaders(jwt.token)
    const platformRes = await this.engineOpenApiConfig.engineOpenApi.getInvestorProvisionRequestList(
      undefined,
      undefined,
      undefined,
      header,
    )
    return InvestorsListMapper(platformRes.data.items)
  }
}
