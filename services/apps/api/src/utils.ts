import { InterestRepaymentPeriod } from "@nd-demo/common"

export const formatTimestamp = (date: Date) => {
  const formattedDate = date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  })

  const formattedTime = date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })

  return `${formattedDate}, ${formattedTime}`
}

export function getInterestRepaymentPeriod(value: string): InterestRepaymentPeriod | undefined {
  const values = Object.values(InterestRepaymentPeriod)

  if (values.includes(value.toUpperCase() as InterestRepaymentPeriod)) {
    return value.toUpperCase() as InterestRepaymentPeriod
  }

  return undefined // or throw an error if an invalid string is passed
}
