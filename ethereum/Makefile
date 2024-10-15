
.PHONY: compile-smart-contracts
compile-smart-contracts:
	npm install

.PHONY: test-smart-contracts
test-smart-contracts:
	npx hardhat test

.PHONY: deploy-contract-testnet
deploy-contract-testnet:
	npx hardhat run scripts/deploy.ts --network sepolia