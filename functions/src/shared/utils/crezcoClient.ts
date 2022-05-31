import axios from "axios"
import { createSignature } from "../../internal/webhooks/sendWebhook"
import { isStrictEnvironment } from "./isStrictEnvironment"

const defaultHeaders = {
  "X-Crezco-Key": process.env.CREZCO_API_KEY
}

const subdomain = isStrictEnvironment(process.env.ENVIRONMENT) ? "api" : "api.sandbox"
const baseUrl = `https://${subdomain}.crezco.com`

export async function fetchBankData() {
  const { data } = await axios.get(`${baseUrl}/v1/banks/GB/DomesticInstantPayment`, {
    headers: defaultHeaders
  })

  return data
}

export async function createPaymentDemand(
  crezcoUserId: string, 
  paymentAttemptId: string,
  paymentIntentId: string,
  reference: string,
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

    const res = await axios.post(`${baseUrl}/v1/users/${crezcoUserId}/pay-demands`, {
      request: {
        reference,
        currency: "GBP",
        amount: `${amount / 100}`,
        useDefaultBeneficiaryAccount: true,
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
