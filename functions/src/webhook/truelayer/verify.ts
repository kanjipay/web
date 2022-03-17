import * as tlSigning from "truelayer-signing"
import { truelayerUrlName } from "../../utils/truelayerClient";
import axios from "axios";

let cacheDate: Date | null
let cachedJwks: string | null

export const verify = async (req) => {
  const tlSignature = req.headers["TL-Signature"];

  if (!tlSignature) {
    return false;
  }

  const jku = tlSigning.extractJku(tlSignature)

  console.log(jku)
  
  if (jku !== `https://webhooks.${truelayerUrlName()}.com/.well-known/jwks`) {
    return false;
  }

  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  let jwks: string

  if (cachedJwks && cacheDate && cacheDate > oneDayAgo) {
    jwks = cachedJwks
  } else {
    const res = await axios.get(jku)
    console.log(res.data)
    jwks = JSON.stringify(res.data)
  }

  const body = JSON.stringify(req.body)

  try {
    tlSigning.verify({
      jwks,
      signature: tlSignature,
      method: tlSigning.HttpMethod.Post,
      path: "/payments",
      body,
      headers: req.headers,
    });

    return true
  } catch (err) {
    console.log(err)
    return false
  }
}