export interface UserSessionInfo {
  userId: string
  role: string
  username: string
  firstName: string
  isFinishedOnboarding: boolean
  systemRole: string[]
}

export interface UserSessionToken {
  userId: string
  token: string
  refreshToken: string
}
