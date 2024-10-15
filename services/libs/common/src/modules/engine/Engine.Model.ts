/* eslint-disable @typescript-eslint/no-explicit-any */
export type ProtocolObject = { [k: string]: any }

export type ProtocolParties = { [k: string]: ProtocolPartyClaim }

export type ProtocolPartyClaim = { [k: string]: string }

export const protoRefId = {
  InvestorProvisioningRequestProtocol: "/nd-1.0.0?/nd/InvestorProvisionRequest",
  OpportunityRequestProtocol: "/nd-1.0.0?/nd/OpportunityRequest",
  AddNewInvestorNotification: "/nd-1.0.0?/nd/AddNewInvestor",
  OpportunityAddInvestor: "/nd-1.0.0?/nd/OpportunityAddInvestor",
  OpportunityContractDeployment: "/nd-1.0.0?/nd/OpportunityContractDeployment",
  OpportunityActivationNotification: "/nd-1.0.0?/nd/OpportunityActivation",
  OpportunityPayInterest: "/nd-1.0.0?/nd/OpportunityPayInterest",
}

export interface ProtocolStatesJson {
  frame: ProtocolFrame
  parties: ProtocolParties
}

export interface ProtocolFrame {
  protocolId: string
  protoRefId: string
  frameValue: string
}

export interface ProtocolFrameTypeName {
  slots: {
    this: {
      ref: {
        typeName: string
      }
    }
  }
}

export interface ProtocolParty {
  protocolId: string
  name: string
  claims: ProtocolPartyClaim
}

export interface ProtocolValueJson {
  value: string
}

export interface ProtocolReferenceJson {
  result: ProtocolValueJson
}

export interface ProtocolInstantiationRequest {
  prototypeId: string
  parties: ProtocolClaimJson[]
  observers: ProtocolObject
  arguments: ProtocolArgJson[]
}

export interface ProtocolClaimJson {
  entity: ProtocolObject | string
  access: ProtocolObject | string
}

export interface ProtocolArgJson {
  nplType: string
  value?: any
  variant?: any
  prototypeId?: string
}

export interface ProtocolJson {
  id: string
  created: string
  currentState: string
  fields: ProtocolObject
  prototypeId: string
  version: number
}

export interface ProtocolStateQueryRequest {
  query: string
}

export interface ProtocolStateParentJson {
  data: {
    protocolStates: {
      nodes: {
        protocolId: string
        protoRefId: string
        frame: string
      }[]
    }
    protocolStatesParties: {
      nodes: {
        protocolId: string
        partyName: string
        claims: string[]
      }[]
    }
  }
}

export interface ProtocolFieldsParentJson {
  data: {
    protocolFieldsTexts: {
      nodes: {
        protocol: {
          protocolId: string
          frame: string
          protoRefId: string
        }
      }[]
    }
  }
}

export interface ProtocolActionResponse {
  commandId: string
  result: {
    value: ProtocolObject
  }
  resultingStates: {
    protocolId: string
    version: string
  }[]
}

export interface ProtocolAction {
  name: string
  protocolId: string
  args: ProtocolArgJson[]
}

export interface OpenApiHeaders {
  headers: {
    "Content-Type": string
    Authorization: string
  }
}

export interface NotificationProtocolStream {
  payloadType: string
  id: string
  notification: {
    type: string
    name: string
    refId: string
    arguments: [{ nplType: string; value: string }]
  }
}
