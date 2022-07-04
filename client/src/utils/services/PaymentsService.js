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

// export async function createPaymentAttemptMoneyhub(paymentIntentId, bankId, deviceId) {
//   const clientState = uuid()
//   const stateId = await saveState({ clientState })

//   const res = await NetworkManager.post("/payment-attempts", {
//     paymentIntentId,
//     deviceId,
//     stateId,
//     clientState,
//     moneyhubBankId: bankId
//   })

//   const { authUrl } = res.data

//   return authUrl
// }

// export async function confirmPayment(code, state, idToken) {
//   try {
//     const res = await NetworkManager.post("/payment-attempts/confirm", {
//       code,
//       state,
//       idToken,
//     })

//     const { paymentAttemptId } = res.data

//     return paymentAttemptId
//   } catch (err) {
//     console.log(err)
//   }
// }
