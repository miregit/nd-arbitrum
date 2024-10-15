#!/bin/sh
set -e

terraform init
terraform apply -auto-approve -state=/state/state.tf
