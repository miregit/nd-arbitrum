import { CustomTransportStrategy, Server } from "@nestjs/microservices"
import { EnvVarsHandler, KeycloakService } from "@nd-demo/common"
import { PinoLogger } from "nestjs-pino"

import { Injectable } from "@nestjs/common"
import EventSource = require("eventsource")

@Injectable()
export class SSETransporter extends Server implements CustomTransportStrategy {
  constructor(
    private readonly keycloakService: KeycloakService,
    private readonly loggerService: PinoLogger,
    private envVarsHandler: EnvVarsHandler,
  ) {
    super()
  }
  handlers = this.getHandlers()
  endpoint = this.envVarsHandler.getValueAndCheck("KEYCLOAK_ENDPOINT")
  nplEngineEndpoint = this.envVarsHandler.getValueAndCheck("ENGINE_ENDPOINT")

  async listen(callback: () => void): Promise<void> {
    try {
      const token = await this.keycloakService.serviceAdminRealmLogin()
      this.loggerService.info({ msg: "Keycloak sign in complete" })
      this.start(token.access_token, callback)
    } catch (error) {
      this.loggerService.error(error)
    }
  }

  start(token: string, callback: () => void): void {
    this.loggerService.info(`Connect to ${this.nplEngineEndpoint} initialised`)

    const source = new EventSource(`${this.nplEngineEndpoint}/api/streams/notifications?me=false`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })

    const handler = (m: unknown) => {
      this.handlers.get("publish")(m)
    }

    source.onopen = (): void => {
      this.loggerService.info(`Connect to ${this.nplEngineEndpoint} established`)
      source.addEventListener("notify", handler)
    }

    source.onerror = (err: unknown): void => {
      if (err) {
        this.loggerService.error(err)
        source.removeEventListener("notify", handler)
        callback()
      }
    }
  }

  close(): void {
    this.loggerService.info(`Connect to ${this.nplEngineEndpoint} closed`)
  }
}
