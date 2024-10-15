import { RSA } from "jwk-to-pem"

export interface KeycloakResponse {
  access_token: string
  refresh_token: string
}

export interface KeycloakClient {
  client_id: string
  client_secret: string
}
export interface KeycloakServiceAccountResponse {
  access_token: string
  expires_in: number
  token_type: string
}

export interface KeycloakJwt {
  address: string
  isFinishedOnboarding: string
  sid: string
  token: string
  preferred_username: string
  given_name: string
  realm_access: {
    roles: string[]
  }
  system_role?: string[]
  email_verified: boolean
}

export interface CreateKeycloakUser {
  fullname: string
  emailAddress: string
  password: string
  role: string
  attributes: KeycloakAttributesInput
  isEmailVerified: boolean
}

export interface CreateServiceAccountClient {
  clientName: string
  systemRole: string[]
}

export interface ResetUserPassword {
  newPassword: string
}

export interface KeycloakClient {
  id: string
  clientId: string
  description: string
  protocol: string
  protocolMappers: ProtocolMapperItem[]
}

interface ProtocolMapperItem {
  id: string
  name: string
  protocol: string
  protocolMapper: string
}

export interface CreateClientRequest {
  clientId: string
  name: string
  description: string
  serviceAccountsEnabled: boolean
  authorizationServicesEnabled: boolean
  publicClient: boolean
  directAccessGrantsEnabled: boolean
  attributes: {
    "access.token.lifespan": number
  }
  protocolMappers: ProtocolMapperRepresentation[]
}

interface ProtocolMapperRepresentation {
  name: string
  protocol: string
  protocolMapper: string
  consentRequired: boolean
  config: { [key: string]: unknown }
}

export interface KeycloakAttributesOutput {
  address?: string[]
  isFinishedOnboarding?: string[]
  isPasswordTemporary?: string[]
  system_role?: string[]
  company?: string[]
  uniquename?: string[]
}

export interface KeycloakAttributesInput {
  address?: string
  isFinishedOnboarding?: string
  isPasswordTemporary?: string
  system_role?: string
  company?: string
  uniquename?: string
}

export interface KeycloakUser {
  id: string
  username: string
  emailVerified: boolean
  attributes: KeycloakAttributesOutput
}
export const ONBOARDING_ATTR = "isFinishedOnboarding"
export interface KeycloakUserRequest {
  username: string
  email: string
  enabled: boolean
  emailVerified: boolean
  firstName: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  attributes: { [k: string]: any }
  credentials: KeycloakUserCredentials[]
  requiredActions: Array<string>
}

export interface KeycloakUserRealmManagementRequest {
  "realm-management": string[]
}

export interface KeycloakUserCredentials {
  type: "password"
  value: string
  temporary: boolean
}

export interface KeycloakVerifyEmailRequest {
  redirect_uri: string
}

export interface KeycloakRoleRequest {
  id: string
  name: string
}

export interface KeycloakRole {
  id: string
  name: string
}

export interface KeycloakCerts {
  keys: RSAPublicKey[]
}

export interface RSAPublicKey extends RSA {
  kid: string
}

export interface JwtClaim {
  sid: string
  sub: string
  preferred_username: string
  given_name: string
  uniquename: string[]
  system_role: string[]
  company: string[]
  token: string
  realm_access: {
    roles: string[]
  }
  email_verified: boolean
  isFinishedOnboarding: boolean
  email: string
}

export interface TokenHeader {
  kid: string
  alg: string
}

export interface FullyProvisioned {
  password: string
}

export interface SetNewPassword {
  type: string
  temporary: string
  value: string
}

export interface UpdateUserAttribute {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  attributes: { [k: string]: any }
}

export const keycloakAttributeValue = (value: string) => `["${value}"]`

export const keycloakAttributeValueArray = (values: string[]) => `[${values.map((value) => `"${value}"`).join(",")}]`

export interface ClientSecretResponse {
  type: string
  value?: string
}

export interface ClientSecretRequest {
  client: string
  realm: string
}

export interface KeycloakResetPasswordRequest {
  value: string
  temporary: boolean
}

export interface UserInfo {
  sub: string
  uniquename: string[]
  email_verified: boolean
  isFinishedOnboarding: boolean
  system_role: string[]
  name: string
  company: string[]
  preferred_username: string
  given_name: string
  email: string
}
