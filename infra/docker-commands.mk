MAKE=make -e
VERSION?=latest
ROOT_PATH =../
MAVEN_CLI_OPTS=-s ../.m2/settings.xml
BLOCKCHAIN_NETWORK_NAME?= hardhatnode

.PHONY:	docker-build
docker-build: export BLOCKCHAIN_NETWORK_NAME=hardhatnode
docker-build:
	docker compose build --build-arg VERSION_ARG=$(VERSION) $(SERVICE)

.PHONY:	docker-push
docker-push:
	docker image tag ghcr.io/noumenadigital/nd-demo/$(SERVICE):latest ghcr.io/noumenadigital/nd-demo/$(SERVICE):$(VERSION)
	docker image push --all-tags ghcr.io/noumenadigital/nd-demo/$(SERVICE)
