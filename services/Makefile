include ../infra/docker-commands.mk

.PHONY: build-services
build-services:
	npx yarn install --immutable
	npx yarn build
	npx yarn lint

.PHONY: build-images
build-images:
	cd ../infra && $(MAKE) docker-build SERVICE=api
	cd ../infra && $(MAKE) docker-build SERVICE=npl-event-publisher
	cd ../infra && $(MAKE) docker-build SERVICE=npl-event-consumer
	#cd ../infra && $(MAKE) docker-build SERVICE=blockchain-event-reader
	cd ../infra && $(MAKE) docker-build SERVICE=deploy-contracts

.PHONY: push-images
push-images:
	cd ../infra && $(MAKE) docker-push SERVICE=api
	cd ../infra && $(MAKE) docker-push SERVICE=npl-event-publisher
	cd ../infra && $(MAKE) docker-push SERVICE=npl-event-consumer
	#cd ../infra && $(MAKE) docker-push SERVICE=blockchain-event-reader
	cd ../infra && $(MAKE) docker-push SERVICE=deploy-contracts

.PHONY: build-and-copy-contracts
build-and-copy-contracts:
	cd ../ethereum && $(MAKE) compile-smart-contracts
	mkdir -p "./libs/common/src/hardhat-generated-resources" && cp -R ../ethereum/typechain-types ./libs/common/src/hardhat-generated-resources
