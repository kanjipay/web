const Moneyhub = require("@mft/moneyhub-api-client")
let moneyhubInstance = null

async function getMoneyhub() {
  console.log("Generating moneyhub client")
  const isLocal = process.env.IS_LOCAL === "TRUE"
  const client_id = isLocal ? process.env.MONEYHUB_CLIENT_ID_LOCAL : process.env.MONEYHUB_CLIENT_ID
  console.log("ClientId: ", client_id)
  const client_secret = isLocal ? process.env.MONEYHUB_CLIENT_SECRET_LOCAL : process.env.MONEYHUB_CLIENT_SECRET
  const redirect_uri = `${process.env.CLIENT_URL}/mh-redirect`
  const response_type = isLocal ? "code" : "code id_token"
  const keysString = isLocal ? process.env.MONEYHUB_PRIVATE_JWKS_LOCAL : process.env.MONEYHUB_PRIVATE_JWKS
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

export async function processAuthSuccess(code: string, state: any, idToken: any, nonce: string) {
  try {
    const moneyhub = await getMoneyhubClient()

    return await moneyhub.exchangeCodeForTokens({
      localParams: {
        nonce,
        state,
      },
      paramsFromCallback: {
        code,
        state,
        id_token: idToken,
      },
    })
  } catch (err) {
    console.log(err)
  }
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

export async function generateAuthUrl(
  bankId: string,
  payeeId: string,
  amount: number,
  payerRef: string,
  state: string,
  nonce: string
) {
  try {
    const moneyhub = await getMoneyhubClient()

    if (process.env.ENVIRONMENT !== "PROD") {
      bankId = "5233db2a04fe41dd01d3308ea92e8bd7"
    }

    return await moneyhub.getPaymentAuthorizeUrl({
      bankId,
      payeeId,
      payeeType: "api-payee",
      context: "PartyToParty",
      amount,
      payeeRef: "Mercado",
      payerRef,
      state,
      nonce
    })
  } catch (err) {
    console.log(err)
  }
}

export async function makeMoneyhubPayment(
  payeeId: string,
  payerRef: string,
  bankId: string,
  stateId: string,
  amount: number,
  paymentAttemptId: string,
) {
  try {
    const state = `${paymentAttemptId}:${stateId}`
    const nonce = paymentAttemptId
    const authUrl = await generateAuthUrl(bankId, payeeId, amount, payerRef, state, nonce)

    return {
      providerData: {},
      providerPrivateData: {},
      providerReturnData: {
        authUrl
      },
    };
  } catch (err) {
    console.log(err)
  }
}