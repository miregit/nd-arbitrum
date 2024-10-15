import {
  AdminClaims,
  ApiErrorCode,
  badRequest,
  EngineOpenApiConfig,
  JwtClaim,
  OpportunityListJson,
  OpportunityRequestStates,
  WorkerClaims,
} from "@nd-demo/common"
import { Injectable } from "@nestjs/common"
import { InjectPinoLogger, PinoLogger } from "nestjs-pino"
import { OpportunityCreation } from "./Opportunity.Model"
import { OpportunityListMapper } from "./Opportunity.Mapper"
import { getInterestRepaymentPeriod } from "../utils"

@Injectable()
export class OpportunityService {
  constructor(
    @InjectPinoLogger(OpportunityService.name) readonly logger: PinoLogger,
    private readonly engineOpenApiConfig: EngineOpenApiConfig,
  ) {}

  async createOpportunityRequest(args: OpportunityCreation, overrideDeadline: boolean, jwt: JwtClaim): Promise<string> {
    const {
      name,
      interestRepayment,
      interestRate,
      minimalTokenTranche,
      nominalAmount,
      subscriptionPeriodEnd,
      maturityDate,
    } = args

    const header = this.engineOpenApiConfig.getHeaders(jwt.token)
    const protocols = await this.engineOpenApiConfig.engineOpenApi.getOpportunityRequestList(
      undefined,
      undefined,
      undefined,
      header,
    )
    let isOpportunityExist = false
    protocols.data.items.forEach((item) => {
      if (item.name === name) {
        isOpportunityExist = true
        return
      }
    })
    if (isOpportunityExist) throw badRequest(ApiErrorCode.OPPORTUNITY_ALREADY_EXISTS)
    const platformRes = await this.engineOpenApiConfig.engineOpenApi.createOpportunityRequest(
      {
        name: name,
        interestRate: interestRate,
        addedBy: jwt.preferred_username,
        minimalTokenTranche: minimalTokenTranche,
        nominalAmount: nominalAmount,
        subscriptionPeriodEnd: subscriptionPeriodEnd,
        maturityDate: maturityDate,
        interestRepaymentPeriod: getInterestRepaymentPeriod(interestRepayment),
        "@parties": {
          admin: {
            entity: { ...AdminClaims },
            access: {},
          },
          investor: {
            entity: {},
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
    await this.engineOpenApiConfig.engineOpenApi.opportunityRequestSendActivationRequest(
      platformRes.data["@id"],
      { overrideDeadline: overrideDeadline },
      undefined,
      undefined,
      header,
    )

    return platformRes.data["@id"]
  }

  async getAllOpportunities(jwt: JwtClaim): Promise<OpportunityListJson> {
    const header = this.engineOpenApiConfig.getHeaders(jwt.token)
    const platformRes = await this.engineOpenApiConfig.engineOpenApi.getOpportunityRequestList(
      undefined,
      undefined,
      undefined,
      header,
    )
    return OpportunityListMapper(platformRes.data.items)
  }

  async addInvestorToOpportunityWhitelist(
    opportunityId: string,
    investorAddress: string,
    jwt: JwtClaim,
  ): Promise<string> {
    const header = this.engineOpenApiConfig.getHeaders(jwt.token)
    const protocol = await this.engineOpenApiConfig.engineOpenApi.getOpportunityRequestByID(
      opportunityId,
      undefined,
      undefined,
      header,
    )
    const isWalletExist = protocol.data.investors.includes(investorAddress)
    if (isWalletExist) {
      throw badRequest(ApiErrorCode.USER_ALREADY_EXISTS)
    }
    const output = await this.engineOpenApiConfig.engineOpenApi.opportunityRequestAddInvestorRequest(
      opportunityId,
      { investorWalletAddress: investorAddress },
      undefined,
      undefined,
      header,
    )
    return output.data["@id"]
  }

  async sendInterestPayForOpportunity(
    opportunityId: string,
    overrideInterestPaymentSchedule: boolean,
    jwt: JwtClaim,
  ): Promise<string> {
    const header = this.engineOpenApiConfig.getHeaders(jwt.token)
    const protocol = await this.engineOpenApiConfig.engineOpenApi.getOpportunityRequestByID(
      opportunityId,
      undefined,
      undefined,
      header,
    )
    if (!protocol.data) {
      throw badRequest(ApiErrorCode.OPPORTUNITY_NOT_EXISTS)
    }
    const isReadyToPay = await this.engineOpenApiConfig.engineOpenApi.opportunityRequestIsReadyToPay(
      opportunityId,
      { overrideInterestPaymentSchedule: overrideInterestPaymentSchedule },
      undefined,
      undefined,
      header,
    )

    if (!isReadyToPay.data) {
      throw badRequest(ApiErrorCode.ITS_NOT_THE_TIME_TO_PAY_THE_INTEREST)
    } else {
      if (protocol.data["@state"] === OpportunityRequestStates.SubscriptionPeriod) {
        await this.engineOpenApiConfig.engineOpenApi.opportunityRequestActivateState(
          opportunityId,
          undefined,
          undefined,
          header,
        )
      } else if (protocol.data["@state"] === OpportunityRequestStates.Expired) {
        throw badRequest(ApiErrorCode.OPPORTUNITY_FINISHED_TO_PAY_INTEREST)
      }
    }
    const res = await this.engineOpenApiConfig.engineOpenApi.opportunityRequestPayInterestRequest(
      opportunityId,
      { overrideInterestPaymentSchedule: overrideInterestPaymentSchedule },
      undefined,
      undefined,
      header,
    )
    return res.data["@id"]
  }
}
