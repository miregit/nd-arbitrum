import { Injectable } from "@nestjs/common"
import { InjectPinoLogger, PinoLogger } from "nestjs-pino"
import { AxiosService } from "../web/Axios.Service"
import {
  ProtocolAction,
  ProtocolActionResponse,
  ProtocolArgJson,
  ProtocolFieldsParentJson,
  ProtocolFrame,
  ProtocolInstantiationRequest,
  ProtocolJson,
  ProtocolObject,
  ProtocolPartyClaim,
  ProtocolReferenceJson,
  ProtocolStateParentJson,
  ProtocolStateQueryRequest,
  ProtocolStatesJson,
} from "./Engine.Model"
import { EnvVarsHandler } from "../env-vars-checker/EnvVars.Handler"
import { timeframeParser } from "./Engine.Utils"

@Injectable()
export class EngineService {
  constructor(
    private axios: AxiosService,
    private envVarsHandler: EnvVarsHandler,
    @InjectPinoLogger(EngineService.name) readonly logger: PinoLogger,
  ) {}

  engineEndpoint = this.envVarsHandler.getValueAndCheck("ENGINE_ENDPOINT")
  graphqlEndpoint = this.envVarsHandler.getValueAndCheck("GRAPHQL_ENDPOINT")

  instantiateProtocol(request: ProtocolInstantiationRequest, jwt: string): Promise<ProtocolReferenceJson> {
    return this.axios.post<ProtocolInstantiationRequest, ProtocolReferenceJson>(
      `${this.engineEndpoint}/api/engine/protocols`,
      request,
      {
        Authorization: `Bearer ${jwt}`,
      },
    )
  }

  callAction(action: ProtocolAction, jwt: string): Promise<ProtocolActionResponse> {
    return this.axios.post<ProtocolArgJson[], ProtocolActionResponse>(
      `${this.engineEndpoint}/api/engine/protocols/${action.protocolId}/actions/${action.name}`,
      action.args,
      {
        Authorization: `Bearer ${jwt}`,
      },
    )
  }

  async getProtocolFields(field: string, value: string, protocolRef: string, jwt: string): Promise<ProtocolFrame[]> {
    const response = await this.axios.post<ProtocolStateQueryRequest, ProtocolFieldsParentJson>(
      `${this.graphqlEndpoint}/graphql`,
      {
        query: `
        {
          protocolFieldsTexts(filter: {field: {equalTo: "${field}"}, value: {equalTo:"${value}"}}) {
            nodes {
              protocol {
                protocolId
                protoRefId
                frame
              }
            }
          }
        }    
        `,
      },
      {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
    )
    return response.data.protocolFieldsTexts.nodes
      .filter((node) => node.protocol.protoRefId === protocolRef)
      .map((node) => ({
        protocolId: node.protocol.protocolId,
        protoRefId: node.protocol.protoRefId,
        frameValue: node.protocol.frame,
      }))
  }

  async getProtocolsByRefId(protoRefId: string, jwt: string): Promise<ProtocolFrame[]> {
    const response = await this.axios.post<ProtocolStateQueryRequest, ProtocolStateParentJson>(
      `${this.graphqlEndpoint}/graphql`,
      {
        query: `
        {
          protocolStates(
            filter: { protoRefId: { equalTo: "${protoRefId}" } }
            orderBy: CREATED_DESC
          ) {
            nodes {
              protocolId
              frame
            }
          }
        }      
        `,
      },
      {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
    )
    return response.data.protocolStates.nodes.map((node) => ({
      protocolId: node.protocolId,
      protoRefId: node.protoRefId,
      frameValue: node.frame,
    }))
  }

  async getProtocolsByRefIdBetweenTimeframe(
    protoRefId: string,
    startDate: Date,
    endTime: Date,
    jwt: string,
  ): Promise<ProtocolFrame[]> {
    const parsedStart = timeframeParser(startDate)
    const parsedEnd = timeframeParser(endTime)
    const response = await this.axios.post<ProtocolStateQueryRequest, ProtocolStateParentJson>(
      `${this.graphqlEndpoint}/graphql`,
      {
        query: `
        {
          protocolStates(
            filter: {
              and: [
                {
                  created: {
                    greaterThanOrEqualTo: "${parsedStart}"
                    lessThanOrEqualTo: "${parsedEnd}"
                  }
                }
              ]
              protoRefId: { equalTo: "${protoRefId}" } 
            }
          ) {
            totalCount
            nodes {
              protocolId
              frame
            }
          }
        }
        `,
      },
      {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
    )
    return response.data.protocolStates.nodes.map((node) => ({
      protocolId: node.protocolId,
      protoRefId: node.protoRefId,
      frameValue: node.frame,
    }))
  }

  async getProtocolsBy(query: ProtocolObject, jwt: string): Promise<ProtocolFrame[]> {
    const queryString = this.stripJsonKeyDoubleQuotes(query)
    this.logger.info({ engine_query: queryString })
    const response = await this.axios.post<ProtocolStateQueryRequest, ProtocolStateParentJson>(
      `${this.graphqlEndpoint}/graphql`,
      {
        query:
          `
        {
          protocolStates(
            filter: ` +
          queryString +
          `,
            orderBy: CREATED_DESC
          ) {
            nodes {
              protocolId
              frame
            }
          }
        }      
        `,
      },
      {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
    )
    return response.data.protocolStates.nodes.map((node) => ({
      protocolId: node.protocolId,
      protoRefId: node.protoRefId,
      frameValue: node.frame,
    }))
  }

  async getProtocolFieldTextBy(query: ProtocolObject, jwt: string): Promise<ProtocolFrame[]> {
    const queryString = this.stripJsonKeyDoubleQuotes(query)
    this.logger.info({ engine_query: queryString })
    const response = await this.axios.post<ProtocolStateQueryRequest, ProtocolFieldsParentJson>(
      `${this.graphqlEndpoint}/graphql`,
      {
        query:
          `        
        {
          protocolFieldsTexts(filter: ` +
          queryString +
          `) {
            nodes {
              protocol {
                protocolId
                protoRefId
                frame
              }
            }
          }
        }  
        `,
      },
      {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
    )
    return response.data.protocolFieldsTexts.nodes.map((node) => ({
      protocolId: node.protocol.protocolId,
      protoRefId: node.protocol.protoRefId,
      frameValue: node.protocol.frame,
    }))
  }

  async getProtocolRefIdFilteredFieldTextBy(
    query: ProtocolObject,
    protoRefId: string,
    jwt: string,
  ): Promise<ProtocolFrame[]> {
    const queryString = this.stripJsonKeyDoubleQuotes(query)
    this.logger.info({ engine_query: queryString })
    const response = await this.axios.post<ProtocolStateQueryRequest, ProtocolFieldsParentJson>(
      `${this.graphqlEndpoint}/graphql`,
      {
        query:
          `        
        {
          protocolFieldsTexts(filter: ` +
          queryString +
          `) {
            nodes {
              protocol {
                protocolId
                protoRefId
                frame
              }
            }
          }
        }  
        `,
      },
      {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
    )
    return response.data.protocolFieldsTexts.nodes
      .filter((node) => node.protocol.protoRefId === protoRefId)
      .map((node) => ({
        protocolId: node.protocol.protocolId,
        protoRefId: node.protocol.protoRefId,
        frameValue: node.protocol.frame,
      }))
  }

  async getProtocolById(protocolId: string, protoRefId: string, jwt: string): Promise<ProtocolFrame | undefined> {
    const response = await this.getProtocolInIds([protocolId], protoRefId, jwt)
    const protocolStatesJson = response.shift()
    if (!protocolStatesJson) return undefined
    return protocolStatesJson.frame
  }

  async getProtocolPartiesById(
    protocolId: string,
    protoRefId: string,
    jwt: string,
  ): Promise<ProtocolStatesJson | undefined> {
    const response = await this.getProtocolInIds([protocolId], protoRefId, jwt)
    return response.shift()
  }

  async getProtocolInIds(protocolIds: string[], protoRefId: string, jwt: string): Promise<ProtocolStatesJson[]> {
    const response = await this.axios.post<ProtocolStateQueryRequest, ProtocolStateParentJson>(
      `${this.graphqlEndpoint}/graphql`,
      {
        query: `
        {
          protocolStates(
            filter: { protocolId: { in: [${protocolIds.map((id) => `"${id}"`).join(",")}] } }
            orderBy: CREATED_DESC
          ) {
            nodes {
              protocolId
              protoRefId
              frame
            }
          }
          protocolStatesParties(
            filter: { protocolId: { in: [${protocolIds.map((id) => `"${id}"`).join(",")}] } }
          ) {
            nodes {
              protocolId
              partyName
              claims
            }
          }
        }      
        `,
      },
      {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
    )
    const frames = response.data.protocolStates.nodes
      .filter((node) => node.protoRefId === protoRefId)
      .map((node) => ({ protocolId: node.protocolId, protoRefId: node.protoRefId, frameValue: node.frame }))

    const parties = response.data.protocolStatesParties.nodes.map((node) => ({
      protocolId: node.protocolId,
      name: node.partyName,
      claims: this.parseClaims(node.claims),
    }))

    return frames.map((frame) => ({
      frame,
      parties: Object.assign(
        {},
        ...parties
          .filter((party) => party.protocolId === frame.protocolId)
          .map((party) => {
            return { [party.name]: party.claims }
          }),
      ),
    }))
  }

  getProtocolState(protocolId: string, jwt: string): Promise<ProtocolJson> {
    return this.axios.get<ProtocolJson>(`${this.graphqlEndpoint}/api/engine/protocols/${protocolId}`, {
      Authorization: `Bearer ${jwt}`,
    })
  }

  stripJsonKeyDoubleQuotes(obj: ProtocolObject) {
    const cleaned = JSON.stringify(obj, null, 2)
    return cleaned.replace(/^[\t ]*"[^:\n\r]+(?<!\\)":/gm, function (match) {
      return match.replace(/"/g, "")
    })
  }

  parseClaims = (claims: string[]): ProtocolPartyClaim =>
    Object.assign(
      {},
      ...claims.map((claim) => {
        const parts = claim.split("\t")
        if (parts.length !== 2) return { "": "" }
        return { [parts[0]]: parts[1] }
      }),
    )
}
