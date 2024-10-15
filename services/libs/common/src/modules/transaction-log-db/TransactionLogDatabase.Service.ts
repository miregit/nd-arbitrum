import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Between, Repository } from "typeorm"
import { TransferEvent } from "./TransferEvent.Entity"
import { InjectPinoLogger, PinoLogger } from "nestjs-pino"
import { EventType, TransferEventValues } from "./TransactionLogDatabase.Model"

@Injectable()
export class TransactionLogDatabaseService {
  constructor(
    @InjectPinoLogger(TransactionLogDatabaseService.name) readonly logger: PinoLogger,
    @InjectRepository(TransferEvent)
    private transferEventsRepository: Repository<TransferEvent>,
  ) {}

  async saveTransferEvent(event: TransferEventValues) {
    try {
      const eventEntity = this.transferEventsRepository.create(event)
      const saveEventOutput = await this.transferEventsRepository.save(eventEntity)
      return saveEventOutput
    } catch (error) {
      this.logger.error(error)
      throw new Error(`Error when saving an event. Error: ${error}`)
    }
  }

  async getAllEvents(): Promise<TransferEvent[]> {
    const eventList = await this.transferEventsRepository.find()
    return eventList
  }

  async findEventByTransactionHash(transaction_hash: string, eventType: EventType): Promise<TransferEvent | undefined> {
    return await this.transferEventsRepository.findOne({ where: { tx_type: eventType, transaction_hash } })
  }

  async getAllDailyTransferEvents(): Promise<TransferEvent[]> {
    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date()
    endOfDay.setHours(23, 59, 59, 999)

    const res = await this.transferEventsRepository.find({
      where: {
        tx_timestamp: Between(startOfDay, endOfDay),
      },
    })
    return res
  }

  async getDailyTransferEventByType(eventType: EventType): Promise<TransferEvent[]> {
    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date()
    endOfDay.setHours(23, 59, 59, 999)

    const res = await this.transferEventsRepository.find({
      where: {
        tx_type: eventType,
        tx_timestamp: Between(startOfDay, endOfDay),
      },
    })
    return res
  }
}
