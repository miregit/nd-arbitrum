MAKE=make -e
ENV_FILE_PATH=../services
NETWORK_ENV=--env-file $(ENV_FILE_PATH)/.env.services.$(BLOCKCHAIN_NETWORK_NAME)
DOCKER_ENV_FLAGS=--env-file $(ENV_FILE_PATH)/.env.services.common --env-file $(ENV_FILE_PATH)/.env.services.secrets --env-file .env.services.docker.url


.PHONY: hardhatnode-local-deploy
hardhatnode-local-deploy: export BLOCKCHAIN_NETWORK_NAME=hardhatnode
hardhatnode-local-deploy:
	docker compose $(DOCKER_ENV_FLAGS) $(NETWORK_ENV) down -v
	docker compose $(DOCKER_ENV_FLAGS) $(NETWORK_ENV) up -d hardhat-node
	$(MAKE) common-local-deployment BLOCKCHAIN_NETWORK_NAME=hardhatnode

.PHONY: testnet-local-deploy
testnet-local-deploy: export BLOCKCHAIN_NETWORK_NAME=sepolia
testnet-local-deploy:
	docker compose $(DOCKER_ENV_FLAGS) $(NETWORK_ENV) down -v
	$(MAKE) common-local-deployment
	$(MAKE) deploy-contracts-testnet-local-deployment
	$(MAKE) app-testnet-local-deployment



#########                  #########
#########  deployment part #########
#########                  #########

.PHONY: common-local-deployment
common-local-deployment:
	# infra services
	#docker compose $(DOCKER_ENV_FLAGS) $(NETWORK_ENV) up -d keycloak keycloak-db keycloak-provisioning consul registrator vault rabbitmq
	docker compose $(DOCKER_ENV_FLAGS) $(NETWORK_ENV) up -d keycloak keycloak-db keycloak-provisioning consul vault rabbitmq
	# npl services
	docker compose 	$(DOCKER_ENV_FLAGS) $(NETWORK_ENV) up -d engine graphql blockchain-events-db blockchain-events-db-creation-script


######### Hardhat Local Network #########

.PHONY: deploy-contracts-hardhatnode-local-deployment
deploy-contracts-hardhatnode-local-deployment: export BLOCKCHAIN_NETWORK_NAME=hardhatnode
deploy-contracts-hardhatnode-local-deployment:
	docker compose $(DOCKER_ENV_FLAGS) $(NETWORK_ENV) up -d deploy-contracts

.PHONY: app-hardhatnode-local-deployment
app-hardhatnode-local-deployment: export BLOCKCHAIN_NETWORK_NAME=hardhatnode
app-hardhatnode-local-deployment:
	# app services
	docker compose $(DOCKER_ENV_FLAGS) $(NETWORK_ENV) up -d  api openapi openapi npl-event-consumer npl-event-publisher


######### Sepolia Testnet #########

.PHONY: deploy-contracts-testnet-local-deployment
deploy-contracts-testnet-local-deployment: export BLOCKCHAIN_NETWORK_NAME=sepolia
deploy-contracts-testnet-local-deployment:
	docker compose $(DOCKER_ENV_FLAGS) $(NETWORK_ENV) up -d deploy-contracts

.PHONY: app-testnet-local-deployment
app-testnet-local-deployment: export BLOCKCHAIN_NETWORK_NAME=sepolia
app-testnet-local-deployment:
	# app services
	docker compose $(DOCKER_ENV_FLAGS) $(NETWORK_ENV) up -d api openapi openapi npl-event-consumer npl-event-publisher


##### clean commands work for both networks

.PHONY: clean-setup-dev
clean-setup-dev: export BLOCKCHAIN_NETWORK_NAME=sepolia
clean-setup-dev:
	docker compose $(DOCKER_ENV_FLAGS) $(NETWORK_ENV) up -d clean-setup-dev-local

.PHONY: clean-local-deployment
clean-local-deployment:
	docker compose $(DOCKER_ENV_FLAGS) down -v
