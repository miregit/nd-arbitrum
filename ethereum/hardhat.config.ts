import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
    solidity: "0.8.9",
    typechain: {
        outDir: "typechain-types",
        target: "ethers-v6",
        alwaysGenerateOverloads: false,
      },
    // networks: {
    //     sepoliaArbitrum: {
    //         url: `${INFURA_ARBITRUM_SEPOLIA_URL}`,
    //         accounts: [`${ACCOUNT_PRIVATE_KEY}`]
    //     },
    // },
    // etherscan: {
    //     apiKey: {
    //         sepolia: `${ETHERSCAN_API_KEY}`
    //     },
    //     url: `${ETHERSCAN_URL}`
    // }
};

export default config;