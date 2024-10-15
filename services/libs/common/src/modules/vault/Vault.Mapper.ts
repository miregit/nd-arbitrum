import { InternalServerErrorException } from "@nestjs/common"
import { PinoLogger } from "nestjs-pino"
import { VaultResponse } from "./Vault.Model"

export const vaultDataMapper = <T>(secret: VaultResponse<T>, logger: PinoLogger): T => {
  if (secret === undefined || !secret?.data?.data) {
    logger.error(`secret does not exist got=${secret}`)
    throw new InternalServerErrorException()
  }
  return secret.data.data
}
