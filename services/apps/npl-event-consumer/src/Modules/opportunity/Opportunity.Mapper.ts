import { OpportunityDeployJson } from "@nd-demo/common"
import {
  AddInvestorToOpportunity,
  AddInvestorToOpportunityNotificationProtocolStream,
  OpportunityDeployNotificationProtocolStream,
  PayInterestForOpportunity,
  PayInterestForOpportunityNotificationProtocolStream,
} from "./Opportunity.Model"

export const OpportunityDataMapper = (data: OpportunityDeployNotificationProtocolStream): OpportunityDeployJson => {
  const [
    name,
    interestRate,
    minimalTokenTranche,
    nominalAmount,
    numberOfTotalPayouts,
    subscriptionPeriodDeadline,
    interestRatePeriodAdjusted,
  ] = data.notification.arguments
  return {
    name: name.value,
    interestRate: interestRate.value,
    minimalTokenTranche: minimalTokenTranche.value,
    nominalAmount: nominalAmount.value,
    numberOfTotalPayouts: numberOfTotalPayouts.value,
    subscriptionPeriodDeadline: subscriptionPeriodDeadline.value,
    interestRatePeriodAdjusted: interestRatePeriodAdjusted.value,
  }
}

export const AddInvestorToOpportunityDataMapper = (
  data: AddInvestorToOpportunityNotificationProtocolStream,
): AddInvestorToOpportunity => {
  const [contractAddress, investorAddress] = data.notification.arguments
  return {
    contractAddress: contractAddress.value,
    investorAddress: investorAddress.value,
  }
}

export const payInterestForOpportunityDataMapper = (
  data: PayInterestForOpportunityNotificationProtocolStream,
): PayInterestForOpportunity => {
  const [contractAddress] = data.notification.arguments
  return {
    opportunityAddress: contractAddress.value,
  }
}
