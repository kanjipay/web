import axios from "axios"
import { createSignature } from "./createSignature"
import { isStrictEnvironment } from "./isStrictEnvironment"

const defaultHeaders = {
  "X-Crezco-Key": process.env.CREZCO_API_KEY
}

const subdomain = isStrictEnvironment(process.env.ENVIRONMENT) ? "api" : "api.sandbox"
const baseUrl = `https://${subdomain}.crezco.com`

export async function fetchBankData(countryCode: string) {
  const { data } = await axios.get(`${baseUrl}/v1/banks/${countryCode}/DomesticInstantPayment`, {
    headers: defaultHeaders
  })

  return data
}

export async function createPaymentDemand(
  crezcoUserId: string, 
  paymentAttemptId: string,
  paymentIntentId: string,
  reference: string,
  amount: number,
  currency: string
) {
  try {
    const expireSeconds = currency === "GBP" ? 60 * 10 : 60 * 60 * 24 * 3
    
    const { signature, signatureError } = createSignature({
      paymentAttemptId,
      environment: process.env.ENVIRONMENT
    }, expireSeconds)

    if (signatureError) {
      return { payDemandError: signatureError }
    }

    const res = await axios.post(`${baseUrl}/v1/users/${crezcoUserId}/pay-demands`, {
      request: {
        reference: reference.length >= 18 ? "Mercado" : reference,
        currency,
        amount: `${amount / 100}`,
        useDefaultBeneficiaryAccount: true,
        metadata: {
          signature
        }
      },
      idempotencyId: paymentAttemptId,
      idemPayDemand: paymentAttemptId
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
  countryCode: string
) {
  try {
    const mercadoRedirectUrl = `${process.env.CLIENT_URL}/checkout/cr-redirect?paymentAttemptId=${paymentAttemptId}`

    const params = {
      bankId,
      countryIso2Code: countryCode,
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

export async function getPaymentStatus(paymentDemandId: string) {
  const paymentsRes = await axios.get(`${baseUrl}/v1/pay-demands/${paymentDemandId}/payments`, { headers: defaultHeaders })
  const paymentStatus = paymentsRes.data[0].status.code

  return paymentStatus
}
