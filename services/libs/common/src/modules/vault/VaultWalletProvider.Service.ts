import { Injectable } from "@nestjs/common"
import { InjectPinoLogger, PinoLogger } from "nestjs-pino"
import { Wallet, ethers } from "ethers"
import { VaultService } from "./Vault.Service"
import { VaultWallet } from "./Vault.Model"

@Injectable()
export class VaultWalletProviderService {
  constructor(
    @InjectPinoLogger(VaultWalletProviderService.name) readonly logger: PinoLogger,
    private readonly vaultService: VaultService,
  ) {}

  async createWallet(): Promise<VaultWallet> {
    const wallet = ethers.Wallet.createRandom()
    const vaultLookupKey = wallet.address
    await this.vaultService.createSecret<VaultWallet>(
      {
        data: {
          address: wallet.address,
          privateKey: wallet.privateKey,
        },
      },
      vaultLookupKey,
    )
    return { address: wallet.address, privateKey: wallet.privateKey }
  }

  connect(wallet: ethers.Wallet, provider: ethers.Provider): Wallet {
    return wallet.connect(provider)
  }

  async getWallet(address: string): Promise<ethers.Wallet> {
    const vaultSecret = await this.vaultService.getSecret<VaultWallet>(address)
    return new ethers.Wallet(vaultSecret.privateKey)
  }
}
