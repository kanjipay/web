import axios from "axios"
import { createSignature } from "../../internal/webhooks/sendWebhook"

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

export async function createUser(idempotencyId: string, companyName: string, email: string) {
  const res = await axios.post(`${baseUrl}/v1/users`, {
    request: {
      firstName: companyName,
      lastName: companyName,
      displayName: companyName,
      eMail: email
    },
    idemUserInfo: {
      idempotencyId
    }
  }, {
    headers: defaultHeaders
  })

  const userId = res.data

  return userId
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
  try {
    const { signature, signatureError } = createSignature({
      paymentAttemptId,
      paymentIntentId,
    }, `${process.env.BASE_URL}/internal`)

    if (signatureError) {
      return { payDemandError: signatureError }
    }

    console.log("signature: ", signature)

    const res = await axios.post(`${baseUrl}/v1/users/${crezcoUserId}/pay-demands`, {
      request: {
        payeeName,
        bban: {
          sortCode: sortCode,
          accountNumber: accountNumber
        },
        reference,
        currency: "GBP",
        amount: `${amount / 100}`,
        metadata: {
          signature
        }
      },
      idempotencyId: paymentAttemptId
    }, {
      headers: defaultHeaders
    })

    const paymentDemandId = res.data

    return { paymentDemandId }
  } catch (err) {
    console.log(err.response)
    return { payDemandError: err }
  }
}

export async function createPayment(
  crezcoUserId: string, 
  crezcoPayDemandId: string,
  paymentAttemptId: string,
  bankId: string,
) {
  try {
    const mercadoRedirectUrl = `${process.env.CLIENT_URL}/checkout/cr-redirect?paymentAttemptId=${paymentAttemptId}`

    const params = {
      bankId,
      countryIso2Code: "GB",
      successCallbackUri: mercadoRedirectUrl,
      failureRedirectUri: mercadoRedirectUrl,
      initialScreen: "ContinueToBank",
      finalScreen: "PaymentStatus"
    }

    const res = await axios.post(`${baseUrl}/v1/users/${crezcoUserId}/pay-demands/${crezcoPayDemandId}/payment`, {}, {
      headers: defaultHeaders,
      params
    })

    const redirectUrl = res.data.redirect

    return { redirectUrl }
  } catch (err) {
    console.log(err.response)
    return { paymentError: err }
  }
}