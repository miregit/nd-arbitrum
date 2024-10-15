# include ../infra/docker-commands.mk

MAVEN_CLI_OPTS=-s ../.m2/settings.xml

.PHONY: build-protocols
build-protocols:
	mvn $(MAVEN_CLI_OPTS) initialize
	mvn $(MAVEN_CLI_OPTS) package

.PHONY: build-images-protocols
build-images-protocols:
	cd ../infra && $(MAKE) docker-build SERVICE=engine