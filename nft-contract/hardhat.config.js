require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");

const ACCOUNT_PRIVATE_KEY = process.env["ACCOUNT_PRIVATE_KEY"]
const INFURA_ARBITRUM_SEPOLIA_URL = process.env["INFURA_ARBITRUM_SEPOLIA_URL"]
const ETHERSCAN_API_KEY = process.env["ETHERSCAN_API_KEY"];
const ETHERSCAN_URL = process.env["ETHERSCAN_URL"];

module.exports = {
    solidity: "0.8.9",
    networks: {
        sepoliaArbitrum: {
            url: `${INFURA_ARBITRUM_SEPOLIA_URL}`,
            accounts: [`${ACCOUNT_PRIVATE_KEY}`]
        },
    },
    etherscan: {
        apiKey: {
            sepolia: `${ETHERSCAN_API_KEY}`
        },
        url: `${ETHERSCAN_URL}`
    }
};
