import { DefaultApi } from "@nd-demo/common/generated-sources/npl"
import { Injectable } from "@nestjs/common"
import { OpenApiHeaders } from "./Engine.Model"

@Injectable()
export class EngineOpenApiConfig {
  public engineOpenApi: DefaultApi
  public getHeaders: (jwt: string) => OpenApiHeaders
}
