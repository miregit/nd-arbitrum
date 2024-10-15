import { InvestorJson, InvestorListJson, InvestorProvisionRequest } from "@nd-demo/common"

export const InvestorsListMapper = (investorProvisionRequestList: InvestorProvisionRequest[]): InvestorListJson => {
  return {
    requests: investorProvisionRequestList.map((item) => investorListJsonMapper(item)),
    cursor: {
      limit: 100,
      skip: -1,
    },
  }
}

const investorListJsonMapper = (protocol: InvestorProvisionRequest): InvestorJson => {
  return {
    name: protocol.name,
    emailAddress: protocol.emailAddress,
    company: protocol.companyName,
    walletAddress: protocol.WalletAddress,
    status: protocol["@state"],
  }
}
