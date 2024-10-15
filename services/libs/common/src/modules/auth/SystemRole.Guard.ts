import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, ForbiddenException } from "@nestjs/common"
import { InjectPinoLogger, PinoLogger } from "nestjs-pino"
import { JwtService } from "./Jwt.Service"
import { KeycloakRoleDefinition } from "../worker/WorkerAccount.Model"

import { SetMetadata } from "@nestjs/common"
import { Reflector } from "@nestjs/core"

export const RealmAccessRole = (role: KeycloakRoleDefinition) => SetMetadata("realm_access_role", role)

@Injectable()
export class SystemRoleGuard implements CanActivate {
  constructor(
    @InjectPinoLogger(SystemRoleGuard.name) readonly logger: PinoLogger,
    readonly reflector: Reflector,
    readonly jwtService: JwtService,
  ) {}

  canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const authorization = context.switchToHttp().getRequest().get("Authorization")
      const jwt = this.jwtService.jwtFromBearer(authorization)
      if (!jwt) throw new UnauthorizedException()
      const jwtClaim = this.jwtService.decodeJwtClaim(jwt)
      const realmAccessRole = this.reflector.get<KeycloakRoleDefinition>("realm_access_role", context.getHandler())
      if (realmAccessRole && !jwtClaim.realm_access.roles.includes(realmAccessRole)) throw new ForbiddenException()
      return Promise.resolve(true)
    } catch (e) {
      this.logger.error(e)
      return Promise.resolve(false)
    }
  }
}
