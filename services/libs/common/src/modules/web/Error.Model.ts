import { BadRequestException } from "@nestjs/common"

export const badRequest = (code: string): BadRequestException => {
  return new BadRequestException({
    code: code,
    message: JSON.stringify({
      name: code,
    }),
  })
}
