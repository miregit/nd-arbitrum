FROM alpine:latest

RUN apk --update add postgresql-client

COPY /create-db/tx-log-db-creation.sql .
COPY blockchain-events-db-creation-script.sh .
RUN  chmod 544 blockchain-events-db-creation-script.sh 

ENTRYPOINT ["/bin/sh", "-c"]