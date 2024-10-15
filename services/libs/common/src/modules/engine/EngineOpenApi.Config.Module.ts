import { Injectable } from "@nestjs/common"
import axios from "axios"
import { Configuration } from "@nd-demo/common/generated-sources/npl/configuration"
import { DefaultApi } from "@nd-demo/common/generated-sources/npl"
import { OpenApiHeaders } from "./Engine.Model"
import { EngineOpenApiConfig } from "./EngineOpenApi.Model"
import { EnvVarsHandler } from "../env-vars-checker/EnvVars.Handler"

@Injectable()
export class EngineOpenApiConfigModule {
  constructor(private envVarsHandler: EnvVarsHandler) {}
  get(): EngineOpenApiConfig {
    const baseUrl = this.envVarsHandler.getValueAndCheck("ENGINE_ENDPOINT")
    const axiosInstance = axios.create({
      baseURL: baseUrl,
      timeout: 60000,
    })
    axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => Promise.reject(error),
    )
    const engineOpenapiConfig = new Configuration()
    const defaultApi = new DefaultApi(engineOpenapiConfig, baseUrl, axiosInstance)
    return {
      engineOpenApi: defaultApi,
      getHeaders: (jwt: string): OpenApiHeaders => {
        return {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwt}`,
          },
        }
      },
    }
  }
}
