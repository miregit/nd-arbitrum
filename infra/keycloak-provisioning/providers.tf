terraform {
  required_providers {
    random = {
      source  = "hashicorp/random"
      version = "3.4.3"
    }
    keycloak = {
      source  = "mrparkers/keycloak"
      version = "4.4.0"
    }
    vault = {
      source  = "hashicorp/vault"
      version = "3.10.0"
    }
  }
}

provider "vault" {}

provider "keycloak" {
  client_id = "admin-cli"
  base_path = ""
}
