export type OpportunityStream =
  | OpportunityDeployNotificationProtocolStream
  | AddInvestorToOpportunityNotificationProtocolStream
  | PayInterestForOpportunityNotificationProtocolStream

export interface OpportunityDeployNotificationProtocolStream {
  payloadType: string
  id: string
  notification: {
    type: string
    name: string
    refId: string
    arguments: [
      { nplType: string; value: string },
      { nplType: string; value: number },
      { nplType: string; value: number },
      { nplType: string; value: number },
      { nplType: string; value: number },
      { nplType: string; value: number },
      { nplType: string; value: number },
      { nplType: string; value: number },
    ]
  }
}

export interface AddInvestorToOpportunityNotificationProtocolStream {
  payloadType: string
  id: string
  notification: {
    type: string
    name: string
    refId: string
    arguments: [{ nplType: string; value: string }, { nplType: string; value: string }]
  }
}

export interface PayInterestForOpportunityNotificationProtocolStream {
  payloadType: string
  id: string
  notification: {
    type: string
    name: string
    refId: string
    arguments: [{ nplType: string; value: string }]
  }
}

export interface AddInvestorToOpportunity {
  contractAddress: string
  investorAddress: string
}

export interface PayInterestForOpportunity {
  opportunityAddress: string
}
