import { TypedDataSigner } from "@ethersproject/abstract-signer"
import { Signer } from "ethers"

export type VaultCreatedResponse = VaultResponse<never>

export interface VaultResponse<T> {
  request_id: string
  lease_id: string
  renewable: boolean
  lease_duration: number
  data: {
    data: T
    metadata: {
      created_time: string
      custom_metadata: string
      deletion_time: string
      destroyed: boolean
      version: number
    }
  }
  wrap_info: string
  warnings: string
  auth: string
}

export interface VaultRequest<T> {
  data: T
}

export interface VaultWallet {
  address: string
  privateKey: string
}

export type WalletSigner = Signer & TypedDataSigner
