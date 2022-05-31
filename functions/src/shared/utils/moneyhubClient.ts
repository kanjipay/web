import Environment from "../enums/Environment"
import LoggingController from "./loggingClient"

const Moneyhub = require("@mft/moneyhub-api-client")
let moneyhubInstance = null

async function getMoneyhub() {
  const isLocal = process.env.ENVIRONMENT === Environment.DEV_LOCAL
  const client_id = isLocal ? process.env.MONEYHUB_CLIENT_ID_LOCAL : process.env.MONEYHUB_CLIENT_ID
  const client_secret = isLocal ? process.env.MONEYHUB_CLIENT_SECRET_LOCAL : process.env.MONEYHUB_CLIENT_SECRET
  const redirect_uri = `${process.env.CLIENT_URL}/checkout/mh-redirect`
  const response_type = isLocal ? "code" : "code id_token"
  const keysString = process.env.MONEYHUB_PRIVATE_JWKS
  const keys = JSON.parse(keysString)

  const config = {
    resourceServerUrl: "https://api.moneyhub.co.uk/v2.0",
    identityServiceUrl: "https://identity.moneyhub.co.uk",
    client: {
      client_id,
      client_secret,
      token_endpoint_auth_method: "private_key_jwt",
      request_object_signing_alg: "RS256",
      id_token_signed_response_alg: "RS256",
      redirect_uri,
      response_type,
      keys
    }
  }

  const moneyhub = await Moneyhub(config)
  moneyhubInstance = moneyhub
  
  return moneyhub
}

const getMoneyhubClient = async () => moneyhubInstance || await getMoneyhub();

export async function processAuthSuccess(
  code: string, 
  state: string, 
  idToken: string, 
  paymentAttemptId: string, 
  stateId: string, 
  clientState: string
) {
  const logger = new LoggingController("Moneyhub process auth success")

  const localState = `${paymentAttemptId}.${stateId}.${clientState}`
  const nonce = paymentAttemptId

  logger.log("States", {
    localState,
    state,
    idToken
  })

  try {
    const moneyhub = await getMoneyhubClient()

    const paramsFromCallback = {
      code,
      state,
    }

    if (process.env.ENVIRONMENT !== Environment.DEV_LOCAL) {
      paramsFromCallback["id_token"] = idToken
    }

    return await moneyhub.exchangeCodeForTokens({
      localParams: {
        nonce,
        state: localState,
      },
      paramsFromCallback,
    })
  } catch (err) {
    console.log(err)
  }
}

export async function getMoneyhubPayment(paymentId: string) {
  const moneyhub = await getMoneyhubClient()
  const { data } = await moneyhub.getPayment({ id: paymentId })

  return data
}

export async function getPayees() {
  try {
    const moneyhub = await getMoneyhubClient()

    return await moneyhub.getPayees()
  } catch (err) {
    console.log(err)
  }
}

export async function createPayee(accountNumber: string, sortCode: string, companyName: string, id: string) {
  try {
    const moneyhub = await getMoneyhubClient()

    const res = await moneyhub.addPayee({
      accountNumber,
      sortCode,
      name: companyName,
      externalId: id
    })

    return res.data
  } catch (err) {
    console.log(err)
  }
}

export async function fetchMoneyhubPayment(paymentId: string) {
  const moneyhub = await getMoneyhubClient()

  const res = await moneyhub.getPayment({
    id: paymentId,
  })

  const errorCode = res.code

  if (errorCode) {
    return { 
      exists: false
    }
  } else {
    return {
      exists: true,
      paymentData: res
    }
  }
}

export async function generateMoneyhubPaymentAuthUrl(
  payeeId: string,
  payerRef: string,
  bankId: string,
  stateId: string,
  clientState: string,
  amount: number,
  paymentAttemptId: string,
): Promise<string> {
  const state = `${paymentAttemptId}.${stateId}.${clientState}`
  const nonce = paymentAttemptId

  try {
    const moneyhub = await getMoneyhubClient()
    const payeeRef = "Mercado"
    const payeeType = "api-payee"

    return await moneyhub.getPaymentAuthorizeUrl({
      bankId,
      payeeId,
      payeeType,
      context: "PartyToParty",
      amount,
      payeeRef,
      payerRef,
      state,
      nonce,
      claims: {
        id_token: {
          "mh:con_id": {
            essential: true,
          },
          "mh:payment": {
            essential: true,
            value: {
              amount,
              payeeRef,
              payerRef,
              payeeId,
              payeeType,
              payerId: null,
              payerType: null,
              payerName: null,
              payerEmail: null,
              readRefundAccount: false
            },
          },
        },
      }
    })
  } catch (err) {
    console.log(err)
  }
}

export async function generateMoneyhubReversePaymentAuthUrl(
  bankId: string, 
  paymentId: string,
  stateId: string,
  clientState: string,
  paymentAttemptId: string
) {
  const state = `${paymentAttemptId}.${stateId}.${clientState}`
  const nonce = paymentAttemptId
  
  try {
    const moneyhub = await getMoneyhubClient()

    return await moneyhub.getReversePaymentAuthorizeUrl({
      bankId,
      paymentId,
      state,
      nonce,
    })
  } catch (err) {

  }
  
}