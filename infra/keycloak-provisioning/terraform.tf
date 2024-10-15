locals {
  url_compatible_special_chars = "-._~"
}

resource "keycloak_realm" "realm" {
  realm = "nd-demo"

  access_token_lifespan                    = "24h"
  action_token_generated_by_admin_lifespan = "24h"
  sso_session_idle_timeout                 = "720h"
  sso_session_max_lifespan                 = "720h"
  client_session_idle_timeout              = "720h"
  client_session_max_lifespan              = "720h"

  login_theme = "kecloak-frontend"
  email_theme = "email-base"
  smtp_server {
    host = "smtp.sendgrid.net"
    from = var.EMAIL_SENDER
    port = "587"
    auth {
      username = "apikey"
      password = var.EMAIL_API_KEY
    }
  }

}

resource "keycloak_role" "nm_user_role" {
  realm_id    = keycloak_realm.realm.id
  name        = "NM_USER"
  description = "Required role for accessing the platform"
}

resource "keycloak_role" "worker_role" {
  realm_id    = keycloak_realm.realm.id
  name        = "worker"
  description = "The blockchain worker used to update events"
}

resource "keycloak_role" "investor_role" {
  realm_id    = keycloak_realm.realm.id
  name        = "investor"
  description = "A investor account"
}

resource "keycloak_role" "admin_role" {
  realm_id    = keycloak_realm.realm.id
  name        = "admin"
  description = "nd admin"
}

resource "keycloak_user_roles" "admin_user_roles" {
  realm_id = keycloak_realm.realm.id
  user_id  = keycloak_user.admin.id

  role_ids = [
    keycloak_role.admin_role.id
  ]
}

resource "keycloak_openid_client" "client" {
  realm_id                     = keycloak_realm.realm.id
  client_id                    = "nd-demo"
  access_type                  = "PUBLIC"
  direct_access_grants_enabled = true
}
resource keycloak_openid_client admin_client {
  realm_id = keycloak_realm.realm.id
  client_id = "admin_client"
  access_type = "CONFIDENTIAL"
  standard_flow_enabled = false
  direct_access_grants_enabled = false
  # use api via token, rather than grant access
  service_accounts_enabled = true
  description = "Client for realm management via API"
  access_token_lifespan= 60
}

resource "random_password" "keycloak_admin" {
  length           = 30
  min_upper        = 2
  min_lower        = 2
  min_numeric      = 2
  min_special      = 2
  override_special = local.url_compatible_special_chars
}

locals {
  keycloak_admin_pass = var.IS_LOCAL == "false" ? random_password.keycloak_admin.result : var.LOCAL_PASS
}

resource "vault_generic_secret" "keycloak_admin" {
  path      = "secret/${var.application_name}/keycloak-admin"
  data_json = <<EOT
{
  "username": "${keycloak_user.admin.username}",
  "password": "${local.keycloak_admin_pass}"
}
EOT
}

resource "vault_generic_secret" "keycloak_admin_client" {
  path      = "secret/${var.application_name}/keycloak-admin-client"
  data_json = <<EOT
{
  "client_id": "${keycloak_openid_client.admin_client.client_id}",
  "client_secret": "${keycloak_openid_client.admin_client.client_secret}"
}
EOT
}

resource "keycloak_user" "admin" {
  realm_id = keycloak_realm.realm.id
  username = "admin@investora.com"

  initial_password {
    value     = local.keycloak_admin_pass
    temporary = false
  }
}

resource "keycloak_openid_user_realm_role_protocol_mapper" "user_realm_role_mapper" {
  realm_id  = keycloak_realm.realm.id
  client_id = keycloak_openid_client.client.id
  name      = "realm roles"

  claim_name = "access_role"
  multivalued = true
}

data "keycloak_openid_client" "realm_management" {
  realm_id  = keycloak_realm.realm.id
  client_id = "realm-management"
}

locals {
  required_service_roles = [
    "manage-clients",
    "manage-users",
    "view-realm",
  ]
}

data keycloak_role realm_view_role {
  realm_id = keycloak_realm.realm.id
  client_id = data.keycloak_openid_client.realm_management.id
  name     = "view-realm"
}
data keycloak_role manage_users_role {
  realm_id = keycloak_realm.realm.id
  client_id = data.keycloak_openid_client.realm_management.id
  name     = "manage-users"
}
data keycloak_role manage_clients {
  realm_id = keycloak_realm.realm.id
  client_id = data.keycloak_openid_client.realm_management.id
  name     = "manage-clients"
}

resource "keycloak_openid_client_service_account_role" "client_service_account_role_manage_users" {
  count                   = length(local.required_service_roles)
  realm_id                = keycloak_realm.realm.id
  client_id               = data.keycloak_openid_client.realm_management.id
  service_account_user_id = keycloak_openid_client.admin_client.service_account_user_id
  role                    = local.required_service_roles[count.index]
}


# create worker client to update npl after we send the request to BC network

resource keycloak_openid_client worker_client {
  realm_id = keycloak_realm.realm.id
  client_id = "worker_client"
  access_type = "CONFIDENTIAL"
  standard_flow_enabled = false
  direct_access_grants_enabled = false
  service_accounts_enabled = true
  description = "Client for worker to use the npl via API"
  access_token_lifespan= 60
}

resource "keycloak_openid_client_service_account_realm_role" "client_service_account_role_worker" {
  realm_id                = keycloak_realm.realm.id
  service_account_user_id = keycloak_openid_client.worker_client.service_account_user_id
  role                    = keycloak_role.worker_role.name
}

resource "vault_generic_secret" "keycloak_worker_client" {
  path      = "secret/${var.application_name}/keycloak-worker-client"
  data_json = <<EOT
{
  "client_id": "${keycloak_openid_client.worker_client.client_id}",
  "client_secret": "${keycloak_openid_client.worker_client.client_secret}"
}
EOT
}

resource "keycloak_openid_user_realm_role_protocol_mapper" "worker_client_role_mapper" {
  realm_id  = keycloak_realm.realm.id
  client_id = keycloak_openid_client.worker_client.id
  name      = "realm roles"

  claim_name = "access_role_client"
  multivalued = true
}