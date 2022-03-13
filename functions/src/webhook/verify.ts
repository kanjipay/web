import jwt from 'jsonwebtoken'
import { plaidClient } from '../utils/plaid'
import sha256 from 'sha256'
// import * as jwkToPem from "jwk-to-pem"

const keyCache = new Map()

export const verify = async (req) => {
  console.log(req.headers)
  const token = req.headers["plaid-verification"]

  if (!token) { return false }

  const decoded = jwt.decode(token, { complete: true })
  console.log(decoded)
  const { header, payload } = decoded

  if (header.alg !== "ES256") { return false }

  const currKeyId = header.kid

  console.log(keyCache)

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

  console.log(keyCache)

  if (!keyCache.has(currKeyId)) {
    return false
  }

  const key = keyCache.get(currKeyId)

  if (key.expired_at != null) {
    return false
  }

  try {
    jwt.verify(token, key)
  } catch (err) {
    console.log(err)
    return false
  }

  const issuedAtSeconds = payload.iat
  const claimedBodyHash = payload.request_body_sha256

  console.log(issuedAtSeconds)
  console.log(claimedBodyHash)

  if (!claimedBodyHash || !issuedAtSeconds || !(typeof issuedAtSeconds === "number")) {
    return false
  }

  const issuedAt = new Date(issuedAtSeconds * 1000)
  const fiveMinsAgo = new Date(Date.now() - (5 * 60 * 1000))

  console.log(issuedAt)
  console.log(fiveMinsAgo)

  if (issuedAt < fiveMinsAgo) { return false }

  const bodyHash = sha256(req.body)

  console.log(bodyHash)

  if (claimedBodyHash !== bodyHash) { return false }

  return true
}