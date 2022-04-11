const Moneyhub = require("@mft/moneyhub-api-client")
const moneyhubInstance = null
const redirectUri = `${process.env.CLIENT_URL}/mh-redirect`

async function getMoneyhub() {
  return await Moneyhub({
    resourceServerUrl: "https://api.moneyhub.co.uk/v2.0",
    identityServiceUrl: "https://identity.moneyhub.co.uk",
    client: {
      client_id: process.env.MONEYHUB_CLIENT_ID,
      client_secret: process.env.MONEYHUB_CLIENT_SECRET,
      token_endpoint_auth_method: "private_key_jwt",
      request_object_signing_alg: "RS256",
      id_token_signed_response_alg: "RS256",
      redirect_uri: redirectUri,
      response_type: "code id_token",
      keys: [{
        "e": "AQAB",
        "n": "4aa54l3TZ3wO90tC29G_N2acSZXNzeBG1s3I2pvUzNM2-i-3aUhunLom7ZQLk5TNhWLdWmFMDq0D79StT3x0E9KQrjwNc5JAX3STQ_7dsl0BijDHdd2uQcAe2EJtsJS5TJEOfMsmkXn10eJEZMyVHJofIq62WCcAGxpuZFDzSRNlKf-MQEZA2RGBcN8DyzMlL6sEkYqiGtr8B7A4_5MYLhTs7HD1d0OoVNruJXawcBa_KNBDs2ppFxuLPN6LCDLfZtDjRxwnJxqUncVt6PDr4Zed_Bqo206aSuLseGbRWrQvU7I0fQhCk2Iw1Z6QcTUNQYOmEsfV4ONZf6uSeyXA0Q",
        "d": "WqdZvGiHWubLOGxjAt7kHES7-xAU62Xz764iyDicqGEekCqFW-W-knZy1zWH5RV9792FIh8-qBK4JyzhJ7LPC3unpmf323thIzg5RbLprBOTX8ozB9Y0gLPHcIhXev505x7LnDUdXIqLyHNHmNtb-G6unYdlOEsKztiyiti-tJc15vt6lOWFsA2UQ9uE2uoH0ziaNufEBhZzsSEsOaYbnEkCGDt-Nj8pGYo4_eYp29msW8wpSqlI50F6zRmtAd5JerJ33HXP9DyFM07cIKqonSuKBhKGCBMbqBsZoldzGUrG9g_A0J5H_nfrvBpDoR4eCyho_jCHapYBfGiQsHeAFQ",
        "p": "-ZDVAK9eI8hRfE_0O4fLwt6kPXIwQhfWrENBDD7TH2SrnHFTYuhPByWmiw-pqMoMS2sMKVLT74jnZWNhQMXnjPwt62fwbZUuLHAjUFBYKfoaaxtCShtjoi1chquz-NYiZQllD1wMUecFawS9BHNlIpLKifuMP8z8DWYp1vTZhvs",
        "q": "53gOJe-0wpOU7w2IBINkjqHNT1kgxClNRqksBgSLxBBuyOi8651wfTO5BlDRl6XZ1aEJ8_uAKhzCpjpdrd31YDu2nP2PCGUV5qYGOvbpvRLS0ZK28Obbio2bElAHKQ6UpXXsCpw7xDY_LG76nZsk-RbpX7MR4L2O3-CWTkGBPaM",
        "dp": "9ft_NxGjJHnJd1IHVLXgbM6t67KlRj_g5CHV94_k4EiFrck1e4OmgVDm-qIRg8DCpYN5lTGCm9LA4Po3XXSzag8V47WrERe9TyeoZv0KKTXO3Esd55VfevZjAIo09ct6U0QTTDRaIFAo0vb0p3Jl-NHeuGosLqaIuVw9WRY1Ygk",
        "dq": "w2iQESjHYkizQAkdXioKl3szV5x31ALGMTQabU4jLDdvP390FjlIwPoMZq-N8cdbGkWkoGwfK-4xyaGWenTadQ6UQP6yZLTqA1kAA4F1nGAqyDBi7wcGKncXhiM3mEqt5O2jguWYczIUrQ9X1fwm_35_MIJ9QkzlNE1mttQIJp8",
        "qi": "5Gu74_e3YqXE2xSQQjiu9gnEn5RxJ-43FXCN6rHRypR_tct7RuN19RDvo5Y8vXxdYM78I7tVU7NDJDDlVWEhpBxbVoYG6AyWhdoixUjShdjEp2n7aytn7zkmkec6apcV0kMk4Wy3oRc115MRW29BFSCrblmKbXm1B6aq_MJv9jU",
        "kty": "RSA",
        "kid": "Z6dWqsCIbyiGfjAM4w1WgLSwYImA4BAE8CwMtRBuNTU",
        "alg": "RS256",
        "use": "sig"
      }]
    }
  })
}

export const getMoneyhubClient = async () => moneyhubInstance || await getMoneyhub();

export async function makeMoneyhubPayment(
  accountNumber: string,
  sortCode: string,
  paymentName: string,
  amount: number,
  userId: string
) {
  return {
    providerData: {},
    providerPrivateData: {},
    providerReturnData: {},
  };
}

export async function getPaymentAuthUrl(bankId: string, payeeId: string, merchantDisplayName: string, amount: number) {
  const moneyhub = await getMoneyhubClient()
  
  return await moneyhub.getPaymentAuthorizeUrl({
    bankId,
    payeeId,
    payeeType: "api-payee",
    context: "PartyToParty",
    amount,
    payeeRef: "Mercado",
    payerRef: merchantDisplayName,
  })
}

// async function getReversePaymentAuthUrl(bankId: string, paymentId: string) {
//   const moneyhub = await getMoneyhubClient()

//   return await moneyhub.getReversePaymentAuthorizeUrl({
//     bankId,
//     paymentId,
//   })
// }

// async function createPaymentAuthRequest(amount: number, userId: string, merchant: any) {
//   const moneyhub = await getMoneyhubClient()

//   const payeeId = merchant.moneyhubPayeeId

//   const tokens = await moneyhub.createAuthRequest({
//     redirectUri,
//     userId,
//     connectionId: "connection-id",
//     scope: "openid payment",
//     payment: {
//       payeeId,
//       amount,
//       payeeRef: "Mercado",
//       payerRef: merchant.displayName
//     },
//   })
// }

// async function processAuthSuccess(authorizationCode: string, state: any, id_token: any) {
//   const moneyhub = await getMoneyhubClient()

//   const tokens = await moneyhub.exchangeCodeForTokens({
//     localParams: {
//       nonce: "your nonce value",
//       state: "your state value",
//     },
//     paramsFromCallback: {
//       code: authorizationCode,
//       state,
//       id_token,
//     },
//   })

//   console.log("processAuthSuccess", tokens)


// }

// async function createMoneyhubUserIfNeeded(userId) {
//   const moneyhub = await getMoneyhubClient()
//   const existingUser = await moneyhub.getUser({ userId })

//   console.log(existingUser)

//   if (!existingUser) {
//     await moneyhub.registerUser({ clientUserId: userId })
//   }
// }

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