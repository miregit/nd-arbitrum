import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from "typeorm"

@Entity("blockchain_event")
export class TransferEvent {
  @PrimaryGeneratedColumn() id: number
  @Column() tx_type: string
  @Column() opportunity_address: string
  @Column() investor: string
  @Column() amount: string
  @Column() token_id: string
  @Column({ unique: true }) transaction_hash: string
  @CreateDateColumn() tx_timestamp: Date
}
