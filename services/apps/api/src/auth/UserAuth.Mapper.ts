import { JwtClaim, KeycloakResponse } from "@nd-demo/common"
import { UserSessionInfo, UserSessionToken } from "./UserAuth.Model"

export const userSessionMapper = (jwtClaim: JwtClaim): UserSessionInfo => {
  const [role] = filterRoles(jwtClaim.realm_access.roles)
  return {
    role: role ?? "UNKNOWN",
    userId: jwtClaim.sid,
    firstName: jwtClaim.given_name,
    username: jwtClaim.preferred_username,
    isFinishedOnboarding: jwtClaim.isFinishedOnboarding,
    systemRole: jwtClaim.system_role,
  }
}
export const userSessionTokenMapper = (keycloakResponse: KeycloakResponse, jwtClaim: JwtClaim): UserSessionToken => {
  return {
    token: jwtClaim.token,
    refreshToken: keycloakResponse.refresh_token,
    userId: jwtClaim.sid,
  }
}

const filterRoles = (roles: string[]) =>
  roles.filter(
    (role) =>
      role !== "NM_USER" &&
      role !== "offline_access" &&
      role !== "uma_authorization" &&
      !role.startsWith("default-roles"),
  )
