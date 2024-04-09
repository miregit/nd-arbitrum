# Ethereum contracts for the Opportunity Token

## Bulding and testing

The project is based on the hardhat. For correct usage of hardhat, the version v16.13.0 of nodejs is needed (if nvm is installed, the version can be set with the command: `nvm use v16.13.0`).

The solidity contract definitions are stored in the [contracts](nft-contract/contracts) folder.

Install dependencies:
`npm install`

To compile the contract, use: 
`npx hardhat compile`

To run tests, use:
`npx hardhat test`

# Contract deployment

For the contract deployment, some parameters need to be set.  

The network parameters should be set in the [hardhat.config.js](hardhat.config.js) file. In order to configure the network, the URL and the private key are needed. For the currently defined networks (Arbitrum Sepolia), the Infura project ID and the account's private key should be provided.
To add a new network, the "networks" json object should be expanded.


If Infura is used, the Infura project should not be protected, because the current version of the deployment script expects that Ethereum network (or proxy to it) is publicly available (if not, the "HardhatError: HH110" error will appear).   

## ContractsRegistry smart contract

Contract registry has no arguments and can be deployed with command:

`npx hardhat run scripts/deployContractsRegistry.js --network sepoliaArbitrum`

## NftContract smart contract

The current version of the contract expects seven parameters. You can set these parameters in the [deployNftContract.js](nft-contract/scripts/deployNftContract.js) file.  

After parameters are set, the contract can be deployed with this command:
`npx hardhat run scripts/deployNftContract.js --network sepoliaArbitrum`

# Contracts operations

The interfaces of the contracts can be found in their source files in the [contracts](nft-contract/contracts) directory.

