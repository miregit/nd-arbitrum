variable "application_name" {
  type        = string
  description = "Application name, used to construct unique secrets, by using it as part of the name"
}

variable "EMAIL_SENDER" {
  type    = string
  default = "no-reply@nd-demo-sandbox.noumenadigital.com"
}

variable "IS_LOCAL" {
  type    = string
  default = "false"
}

variable "LOCAL_PASS" {
  type    = string
  default = "nd-demo123!"
}

variable "EMAIL_API_KEY" {
  type    = string
}