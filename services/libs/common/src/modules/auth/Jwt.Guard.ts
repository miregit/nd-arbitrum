import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common"
import { InjectPinoLogger, PinoLogger } from "nestjs-pino"
import { JwtService } from "./Jwt.Service"

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(@InjectPinoLogger(JwtGuard.name) readonly logger: PinoLogger, private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      await this.jwtService.auth(context.switchToHttp().getRequest().get("Authorization"))
      return true
    } catch (e) {
      this.logger.error(e)
      return false
    }
  }
}
