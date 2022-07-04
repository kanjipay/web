import axios from "axios"

export async function fetchMoneyhubBankData() {
  const res = await axios.get(
    "https://identity.moneyhub.co.uk/oidc/.well-known/api-connections"
  )

  return res.data
    .filter((datum) => {
      return (
        datum.country === "GB" &&
        !datum.isBeta &&
        datum.accountTypes.some((accountType) => accountType.name === "cash") &&
        datum.status.sync === "AVAILABLE" &&
        datum.status.auth === "AVAILABLE" &&
        datum.userTypes.includes("personal")
      )
    })
    .map((datum) => {
      datum.name = datum.name.replace(" Open Banking", "")
      return datum
    })
}
