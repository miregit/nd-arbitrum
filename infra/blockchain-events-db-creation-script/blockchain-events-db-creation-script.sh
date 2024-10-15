#!/bin/sh

echo "###create table if exist"

psql $BLOCKCHAIN_EVENTS_DB_URL -a -f ./tx-log-db-creation.sql

echo "###create table if exist is done"