import { EventType, TransferEventValues } from "@nd-demo/common"

export const TransferEventMapper = (
  tx_type: EventType,
  opportunity_address: string,
  investor: string,
  token_id: string,
  transaction_hash: string,
  amount: string,
): TransferEventValues => {
  return {
    tx_type: tx_type,
    opportunity_address: opportunity_address,
    investor: investor,
    token_id: token_id,
    amount: amount,
    transaction_hash: transaction_hash,
  }
}
