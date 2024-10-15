import { Injectable } from "@nestjs/common"
import { InjectPinoLogger, PinoLogger } from "nestjs-pino"
import {
  ContractConfig,
  EngineOpenApiConfig,
  EventType,
  TransactionLogDatabaseService,
  WorkerAccountService,
} from "@nd-demo/common"
import { ethers } from "ethers"
import { TransferEventMapper } from "./EventReader.Mapper"

@Injectable()
export class EventReaderService {
  constructor(
    @InjectPinoLogger(EventReaderService.name) readonly logger: PinoLogger,
    private contractConfig: ContractConfig,
    private readonly transactionLogDatabaseService: TransactionLogDatabaseService,
    private readonly engineOpenApiConfig: EngineOpenApiConfig,
    private readonly workerAccountService: WorkerAccountService,
  ) {}

  async listenToEvents(): Promise<void> {
    this.logger.info(
      `start listen to opportunity management contract..... ${this.contractConfig.opportunityManagementAddress}`,
    )
    try {
      ;(
        await this.contractConfig.opportunityManagement.on(
          this.contractConfig.opportunityManagement.filters.MintedToken,
          async (opportunityAddress, sender, amount, tokenId, event) => {
            const ev = await event.getTransactionReceipt()
            await this.mintEventHandler(opportunityAddress, sender, tokenId, amount, ev.hash)
          },
        )
      ).on(this.contractConfig.opportunityManagement.filters.LastInterestsPaid, async (opportunityAddress) => {
        await this.LastPaymentEventHandler(opportunityAddress)
      })
    } catch (error) {
      this.logger.error(error)
      throw new Error(`Error when listening to events:", ${error}`)
    }
  }

  async mintEventHandler(
    opportunityAddress: string,
    investor: string,
    tokenId: bigint,
    amount: bigint,
    transactionHash: string,
  ) {
    this.logger.info(
      `got MINT event with amount of ${ethers.formatEther(amount.toString())} and tx hash: ${transactionHash}`,
    )
    const existingEvent = await this.transactionLogDatabaseService.findEventByTransactionHash(
      transactionHash,
      EventType.MINT,
    )
    if (!existingEvent) {
      const transferEvent = TransferEventMapper(
        EventType.MINT,
        opportunityAddress,
        investor,
        ethers.formatEther(tokenId.toString()),
        transactionHash,
        ethers.formatEther(amount.toString()),
      )
      const res = await this.transactionLogDatabaseService.saveTransferEvent(transferEvent)
      this.logger.info(`event ${res.id} was send to db...`)
    }
  }

  async LastPaymentEventHandler(opportunityAddress: string) {
    this.logger.info(`got Last Payment event to opportunity: ${opportunityAddress}`)
    const workerToken = await this.workerAccountService.getWorkerClientAccessToken()
    const header = this.engineOpenApiConfig.getHeaders(workerToken.access_token)
    const protocols = await this.engineOpenApiConfig.engineOpenApi.getOpportunityRequestList(
      undefined,
      undefined,
      undefined,
      header,
    )
    let opportunityId = ""
    protocols.data.items.forEach((item) => {
      if (item.contractAddress === opportunityAddress) {
        opportunityId = item["@id"]
        return
      }
    })
    if (opportunityId) {
      const workerToken = await this.workerAccountService.getWorkerClientAccessToken()
      const header = this.engineOpenApiConfig.getHeaders(workerToken.access_token)
      await this.engineOpenApiConfig.engineOpenApi.opportunityRequestUpdateExpiredState(
        opportunityId,
        undefined,
        undefined,
        header,
      )
    }
  }
}
