#########         #########
#########  sonar  #########
#########         #########

.PHONY: sonar-scan
sonar-scan:
	mvn $(MAVEN_CLI_OPTS) -B verify org.sonarsource.scanner.maven:sonar-maven-plugin:sonar -Dsonar.projectKey=ND-Arbitrum_nd-arbitrum