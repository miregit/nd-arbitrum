import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from "@nestjs/common"
import axios, { AxiosResponse } from "axios"
import { InjectPinoLogger, PinoLogger } from "nestjs-pino"

@Injectable()
export class AxiosService {
  constructor(@InjectPinoLogger(AxiosService.name) readonly logger: PinoLogger) {}

  defaultHeaders = {
    Accept: "application/json",
    "Content-Type": "application/json",
  }

  get<T>(url: string, headers?: Record<string, string>): Promise<T> {
    this.logger.info(url)
    return this.handle(
      axios.get<T>(url, {
        headers: {
          ...this.defaultHeaders,
          ...headers,
        },
      }),
    )
  }

  post<R, T>(url: string, body?: R, headers?: Record<string, string>): Promise<T> {
    this.logger.info({ url, body })
    return this.handle(
      axios.post<T>(url, body, {
        headers: {
          ...this.defaultHeaders,
          ...headers,
        },
      }),
    )
  }

  put<R, T>(url: string, body?: R, headers?: Record<string, string>): Promise<T> {
    this.logger.info(url)
    return this.handle(
      axios.put<T>(url, body ? this.jsonBody(body) : undefined, {
        headers: {
          ...this.defaultHeaders,
          ...headers,
        },
      }),
    )
  }

  delete<T>(url: string, headers?: Record<string, string>): Promise<T> {
    this.logger.info(url)
    return this.handle(
      axios.delete<T>(url, {
        headers: {
          ...this.defaultHeaders,
          ...headers,
        },
      }),
    )
  }

  jsonBody<T>(body: T | null): string | null {
    if (body !== null) {
      return JSON.stringify(body)
    } else {
      return null
    }
  }

  private async handle<T>(request: Promise<AxiosResponse<T>>): Promise<T> {
    try {
      const response = await request
      if (response.status === 204) {
        return void 0
      } else if (response.status < 200 || response.status >= 300) {
        this.logger.error(`Unknown status got=${response.status} expected=200..299`)
        throw new InternalServerErrorException()
      } else if (response.status !== 201 && !response.data) {
        this.logger.error("Expected a method body, got undefined")
        throw new InternalServerErrorException()
      } else {
        this.logger.info({ url: response.config.url, method: response.config.method, responseBody: response.data })
        return response.data
      }
    } catch (e) {
      if (e.response?.status === 400) {
        throw new BadRequestException(e.response?.data ?? {})
      } else if (e.response?.status === 401) {
        throw new UnauthorizedException()
      } else if (e.response?.status === 403) {
        throw new ForbiddenException()
      } else if (e.response?.status === 409) {
        throw new ConflictException()
      } else {
        this.logger.error(e)
        throw new InternalServerErrorException()
      }
    }
  }
}
