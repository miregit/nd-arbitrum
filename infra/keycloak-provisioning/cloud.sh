#!/bin/sh
echo "###create backend file"
set -e

cat > /terraform/backend.tf <<EOT
terraform {
  backend "consul" {
    address="consul.service.consul:8500"
    path="terraform/keycloak"
  }
}
EOT

echo "### ls ltr###"
ls -ltr
echo "### tf init ###"
terraform init
echo "### tf apply ###"
terraform apply -auto-approve

echo "###script finished successfully ###"
