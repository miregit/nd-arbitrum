import {
  OpportunityJson,
  OpportunityJsonInterestRepaymentEnum,
  OpportunityListJson,
  OpportunityRequest,
} from "@nd-demo/common"

export const OpportunityListMapper = (opportunityProvisionRequestList: OpportunityRequest[]): OpportunityListJson => {
  return {
    requests: opportunityProvisionRequestList.map((item) => opportunityListJsonMapper(item)),
    cursor: {
      limit: 100,
      skip: -1,
    },
  }
}

const opportunityListJsonMapper = (protocol: OpportunityRequest): OpportunityJson => {
  return {
    id: protocol["@id"],
    name: protocol.name,
    interestRepayment: protocol.interestRepaymentPeriod.toString() as OpportunityJsonInterestRepaymentEnum,
    interestRate: protocol.interestRate,
    nominalAmount: protocol.nominalAmount,
    minimalTokenTranche: protocol.minimalTokenTranche,
    numberOfPayments: protocol.numberOfPayments,
    subscriptionPeriodEnd: protocol.subscriptionPeriodEnd,
    maturityDate: protocol.maturityDate,
    contractAddress: protocol.contractAddress,
    state: protocol["@state"],
    investorWhiteList: protocol.investors,
  }
}
