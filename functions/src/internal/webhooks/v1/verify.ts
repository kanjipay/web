import axios from "axios";
import * as jwt from "jsonwebtoken";
import * as jwkToPem from "jwk-to-pem";

const keyCache = new Map()

export const verify = async (req, res, next) => {
  const token = req.body.toString()

  let decoded

  try {
    decoded = jwt.decode(token, { complete: true })
  } catch (err) {
    console.log(err)
    return res.status(403).send("Unauthorized");
  }

  const currKeyId = decoded.header.kid

  // If keyId not in cache, make a call to the endpoint that has the up to date ones
  if (!keyCache.has(currKeyId)) {
    const configRes = await axios.get("https://identity.moneyhub.co.uk/oidc/.well-known/openid-configuration")
    const jwkUri = configRes.data.jwks_uri
    const jwksRes = await axios.get(jwkUri)
    const jwks = jwksRes.data
    const loadedKeys = jwks.keys.filter(key => key.use === "sig")

    keyCache.clear()

    for (const key of loadedKeys) {
      const keyId = key.kid
      keyCache.set(keyId, key)
    }

    // If the received key id is not in the ones retrieved from Moneyhub, raise error
    if (!keyCache.has(currKeyId)) {
      return res.status(403).send("Unauthorized");
    }
  }

  const key = keyCache.get(currKeyId);
  const pem = jwkToPem(key);

  let payload

  try {
    payload = jwt.verify(token, pem)
    req.payload = payload
    next()
  } catch (err) {
    console.log(err)
    return res.status(403).send("Unauthorized");
  }
}