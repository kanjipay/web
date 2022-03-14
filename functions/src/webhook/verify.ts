import * as jwt from 'jsonwebtoken'
import { plaidClient } from '../utils/plaidClient'
import * as sha256 from 'sha256'
import * as jwkToPem from "jwk-to-pem"

const keyCache = new Map()

export const verify = async (req) => {
  const token = req.headers["plaid-verification"]

  if (!token) { return false }

  const { header } = jwt.decode(token, { complete: true })

  if (header.alg !== "ES256") { return false }

  const currKeyId = header.kid

  if (!keyCache.has(currKeyId)) {
    let keyIdsToUpdate = []

    keyCache.forEach((keyId, key) => {
      if (key.expired_at != null) {
        keyIdsToUpdate.push(keyId)
      }
    })

    keyIdsToUpdate.push(currKeyId)

    for (const keyId of keyIdsToUpdate) {
      const keyResponse = await plaidClient.webhookVerificationKeyGet({ key_id: currKeyId })
        // .catch(err => {
        //   console.log(err)
        //   return false
        // })

      const key = keyResponse.data.key

      console.log(key)

      keyCache.set(keyId, key)
    }
  }

  if (!keyCache.has(currKeyId)) { return false }

  const key = keyCache.get(currKeyId)

  if (key.expired_at != null) { return false }

  const pem = jwkToPem(key)

  let payload: jwt.JwtPayload

  try {
    const payloadRes = jwt.verify(token, pem)

    if (typeof payloadRes === "string") {
      payload = JSON.parse(payloadRes)
    } else {
      payload = payloadRes
    }
  } catch (err) {
    console.log(err)
    return false
  }

  const issuedAtSeconds = payload.iat
  const claimedBodyHash = payload.request_body_sha256

  if (!claimedBodyHash || !issuedAtSeconds || !(typeof issuedAtSeconds === "number")) {
    return false
  }

  const issuedAt = new Date(issuedAtSeconds * 1000)
  const fiveMinsAgo = new Date(Date.now() - (5 * 60 * 1000))

  if (issuedAt < fiveMinsAgo) { return false }

  const bodyString = JSON.stringify(req.body, null, 2)
  const bodyHash = sha256(bodyString)

  return claimedBodyHash === bodyHash
}