import { NetworkManager } from "../NetworkManager"

export async function createPaymentAttemptCrezco(
  orderId,
  bankCode,
  countryCode,
  deviceId
) {
  const res = await NetworkManager.post("/payment-attempts/crezco", {
    orderId,
    deviceId,
    countryCode,
    crezcoBankCode: bankCode,
  })

  const { redirectUrl } = res.data

  return redirectUrl
}
