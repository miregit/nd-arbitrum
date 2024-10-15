SHELL := /bin/bash
include ./docker-commands.mk
include ./local-deployment.mk

#########       #########
#########  all  #########
#########       #########

.PHONY: build_all
build_all: build_lint_all build_image_all

.PHONY: build_lint_all
build_lint_all: build-npl-protocols build-lint-services

.PHONY: build_image_all
build_image_all: build-images-services build-images-npl-protocols build-images-common

.PHONY: push_all
push_all: push-images-npl-protocols push-images-services push-images-common

#########       #########
#########  NPL  #########
#########       #########

.PHONY: build-npl-protocols
build-npl-protocols:
	cd $(ROOT_PATH)npl && $(MAKE) build-protocols

.PHONY: build-images-npl-protocols
build-images-npl-protocols:
	cd $(ROOT_PATH)npl && $(MAKE) build-images-protocols

.PHONY: push-images-npl-protocols
push-images-npl-protocols:
	$(MAKE) docker-push SERVICE=engine


#########            #########
#########  services  #########
#########            #########

.PHONY: build-lint-services
build-lint-services:
	cd $(ROOT_PATH)services && $(MAKE) build-services

.PHONY: build-images-services
build-images-services:
	cd $(ROOT_PATH)services &&  $(MAKE) build-images

.PHONY: push-images-services
push-images-services:
	cd $(ROOT_PATH)services && $(MAKE) push-images


#########            #########
#########  common    #########
#########            #########

.PHONY: build-images-common
build-images-common:
	$(MAKE) docker-build SERVICE=keycloak
	$(MAKE) docker-build SERVICE=keycloak-provisioning
	$(MAKE) docker-build SERVICE=openapi
	$(MAKE) docker-build SERVICE=rabbitmq
	$(MAKE) docker-build SERVICE=blockchain-events-db-creation-script

.PHONY: push-images-common
push-images-common:
	$(MAKE) docker-push SERVICE=keycloak
	$(MAKE) docker-push SERVICE=keycloak-provisioning
	$(MAKE) docker-push SERVICE=openapi
	$(MAKE) docker-push SERVICE=rabbitmq
	$(MAKE) docker-push SERVICE=blockchain-events-db-creation-script


#########            #########
#########  ethereum  #########
#########            #########

.PHONY: build-contracts
build-contracts:
	cd $(ROOT_PATH)ethereum && $(MAKE) compile-smart-contracts

.PHONY: test-contracts
test-contracts:
	cd $(ROOT_PATH)ethereum &&  $(MAKE) test-smart-contracts
