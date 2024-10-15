import { Injectable } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"

@Injectable()
export class EnvVarsHandler {
  constructor(readonly configService: ConfigService) {}

  public getValueAndCheck(name: string): string {
    const value = this.configService.get<string>(name)

    if (!value) {
      throw new Error(`the environment variable ${name} is missing!!`)
    }
    return value
  }
}
