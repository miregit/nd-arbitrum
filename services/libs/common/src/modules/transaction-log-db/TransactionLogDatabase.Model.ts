export interface TransferEventValues {
  tx_type: EventType
  opportunity_address: string
  investor: string
  amount: string
  token_id: string
  transaction_hash: string
}

export enum EventType {
  MINT = "0",
  BURN = "1",
}
