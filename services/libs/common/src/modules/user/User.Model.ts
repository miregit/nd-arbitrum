export interface VaultUser {
  address: string
  privatekey: string
  identifier: string
}

export const WorkerClaims = {
  access_role_client: ["default-roles-nd-demo", "offline_access", "uma_authorization", "worker"],
}

export const AdminClaims = {
  access_role: ["admin"],
}

export const InvestorClaims = {
  company: ["investmentCompeny"],
}
