import { Body, Controller, Get, Post, Put, Headers } from "@nestjs/common"

import { UserAuthService } from "./UserAuth.Service"
import { AuthInfoJson, AuthRefreshRequest, AuthRequest, AuthTokenJson } from "@nd-demo/common"

@Controller()
export class UserAuthController {
  constructor(private readonly userAuthService: UserAuthService) {}

  @Post("/api/v1/session/authenticate/")
  async createUserSession(@Body() body: AuthRequest): Promise<AuthTokenJson> {
    return await this.userAuthService.createUserSession(body.username, body.password)
  }
  @Put("/api/v1/session/refresh/")
  async refreshUserSession(@Body() body: AuthRefreshRequest): Promise<AuthTokenJson> {
    return await this.userAuthService.refreshUserSession(body.refreshToken)
  }

  @Get("/api/v1/session/info/")
  getUserSessionInfo(@Headers("Authorization") bearer: string): AuthInfoJson {
    return this.userAuthService.getUserSessionInfo(bearer)
  }
}
