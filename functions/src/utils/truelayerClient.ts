import axios from "axios"
import * as tlSigning from "truelayer-signing"
import * as jwt from "jsonwebtoken";
import { v4 as uuid } from "uuid";
import * as base64 from "base-64";

const defaultHeaders = {
  "Content- Type": "application/json",
  "Accept": "application/json"
}

export function truelayerUrlName() {
  return process.env.ENVIRONMENT === 'PROD' ? "truelayer" : "truelayer-sandbox"
}

export async function createAccessToken() {
  const headers = {
    "Idempotency-Key": uuid(),
    ...defaultHeaders
  }

  const body = {
    grant_type: "client_credentials",
    client_id: process.env.TRUELAYER_CLIENT_ID,
    client_secret: process.env.TRUELAYER_CLIENT_SECRET,
    scope: "payments"
  }

  const res = await axios.post(`https://auth.${truelayerUrlName()}.com/connect/token`, body, { headers })

  return res.data.access_token
}

export async function createPaymentWithAccessToken(
  accessToken: string, 
  amountInPence: number, 
  paymentName: string, 
  sort_code: string, 
  account_number: string, 
  userId: string
) {
  const { header } = jwt.decode(accessToken, { complete: true });
  const { kid } = header

  const body = {
    amount_in_minor: amountInPence,
    currency: "GBP",
    payment_method: {
      type: "bank_transfer",
      beneficiary: {
        type: "external_account",
        account_holder_name: paymentName,
        reference: "Mercado",
        account_identifier: {
          type: "sort_code_account_number",
          sort_code,
          account_number
        }
      },
      provider_selection: {
        type: "user_selected"
      },
      user: {
        id: userId,
        name: "Customer" // Documentation said unregulated clients have to provide this value
      }
    }
  }

  const bodyString = JSON.stringify(body)
  const privateKeyPem = base64.decode(process.env.TRUELAYER_PRIVATE_KEY_PEM)

  const signature = tlSigning.sign({
    kid,
    privateKeyPem,
    method: tlSigning.HttpMethod.Post,
    path: "/payments",
    headers: { "Idempotency-Key": uuid() },
    body: bodyString
  })

  const headers = {
    "Tl-Signature": signature,
    "Idempotency-Key": uuid(),
    ...defaultHeaders
  }

  const res = await axios.post(`https://api.${truelayerUrlName()}.com/payments`, body, { headers })
  const { id, resource_token } = res.data

  const paymentId = id
  const resourceToken = resource_token

  return { paymentId, resourceToken }
}