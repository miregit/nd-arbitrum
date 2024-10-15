export interface FaucetWallet {
  address: string
  privateKey: string
}

export interface OpportunityDeployJson {
  name: string
  interestRate: number
  minimalTokenTranche: number
  numberOfTotalPayouts: number
  nominalAmount: number
  subscriptionPeriodDeadline: number
  interestRatePeriodAdjusted: number
}
