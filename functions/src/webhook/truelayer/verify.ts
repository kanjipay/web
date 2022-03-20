import * as tlSigning from "truelayer-signing"
import { truelayerUrlName } from "../../utils/truelayerClient";
import axios from "axios";

let cacheDate: Date | null
let cachedJwks: string | null

function parseRawHeaders(arr: string[]) {
  const len = arr.length
  if (len % 2 !== 0) {
    throw new Error("Headers array cannot have an odd number of elements")
  }

  let i = 0

  const headers = {}

  while (i < len) {
    if (i % 2 !== 0) {
      const key = arr[i - 1]
      const value = arr[i]

      headers[key] = value
    }

    i++
  }

  return headers
}

export const verify = async (req) => {
  const headers = parseRawHeaders(req.rawHeaders)
  console.log("Headers: ", JSON.stringify(headers))
  const tlSignature = headers["Tl-Signature"];

  console.log("tlSignature: ", tlSignature)

  if (!tlSignature) {
    return false;
  }

  const jku = tlSigning.extractJku(tlSignature)
  
  if (jku !== `https://webhooks.${truelayerUrlName()}.com/.well-known/jwks`) {
    return false;
  }

  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  let jwks: string

  if (cachedJwks && cacheDate && cacheDate > oneDayAgo) {
    console.log("cached jwks found")
    jwks = cachedJwks
  } else {
    console.log("no cached jwks, retrieving from url")
    const res = await axios.get(jku)
    console.log("jwks: ", JSON.stringify(res.data))
    jwks = JSON.stringify(res.data)
  }

  const body = JSON.stringify(req.body)

  console.log("body: ", body)

  try {
    tlSigning.verify({
      jwks,
      signature: tlSignature,
      method: tlSigning.HttpMethod.Post,
      path: "/webhook/truelayer",
      body,
      headers
    });

    return true
  } catch (err) {
    console.log(err)
    console.log(err.message)
    return false
  }
}