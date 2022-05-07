import axios from "axios"

const defaultHeaders = {
  "X-Crezco-Key": process.env.CREZCO_API_KEY
}

const baseUrl = process.env.CREZCO_URL

export async function fetchBankData() {
  const { data } = await axios.get(`${baseUrl}/v1/banks/GB/DomesticInstantPayment`, {
    headers: defaultHeaders
  })

  return data
}

export async function createUser() {

}

export async function createPaymentDemand(
  crezcoUserId: string, 
  paymentAttemptId: string,
  paymentIntentId: string,
  payeeName: string,
  reference: string,
  sortCode: string,
  accountNumber: string,
  amount: number
) {
  const res = await axios.post(`${baseUrl}/v1/users/${crezcoUserId}/pay-demands`, {
    request: {
      payeeName,
      bban: {
        sortCode,
        accountNumber
      },
      reference,
      currency: "GBP",
      amount,
      metadata: {
        paymentAttemptId,
        paymentIntentId
      }
    },
    idempotencyId: paymentAttemptId
  }, {
    headers: defaultHeaders
  })

  const paymentDemandId = res.data

  return paymentDemandId
}

export async function createPayment(
  crezcoUserId: string, 
  crezcoPayDemandId: string,
  bankId: string,
) {
  const res = await axios.post(`${baseUrl}/v1/users/${crezcoUserId}/pay-demands/${crezcoPayDemandId}/payment)`, {
    bankId,
    countryIso2Code: "GB",
    successCallbackUri: `${process.env.CLIENT_URL}/checkout/cr-redirect`,
    failureRedirectUri: `${process.env.CLIENT_URL}/checkout/cr-redirect`,
    initialScreen: "ContinueToBank",
    finalScreen: "PaymentStatus"
  }, {
    headers: defaultHeaders
  })

  const redirectUri = res.data

  return redirectUri
}
