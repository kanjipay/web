import LoggingController from "./loggingClient"
import * as jwt from "jsonwebtoken"
import * as jwkToPem from "jwk-to-pem";

const keyCache = new Map()

export const verifyMercadoSignature = async (signature: string) => {
  const logger = new LoggingController("Verifying Mercado signature")

  const decoded = jwt.decode(signature, { complete: true })
  const receivedKid = decoded.header.kid
  
  logger.log("Got kid from signature", { receivedKid })

  if (!keyCache.has(receivedKid)) {
    logger.log("Kid not in cache, retrieving")
    const loadedKeys = JSON.parse(process.env.JWKS_PUBLIC_KEY).keys.filter(key => key.use === "sig")
    logger.log("Got JWKS", { loadedKeys })

    keyCache.clear()

    for (const key of loadedKeys) {
      keyCache.set(key.kid, key)
    }

    if (!keyCache.has(receivedKid)) {
      logger.log("Kid not in jwks")
      return { isVerified: false }
    }
  }

  const key = keyCache.get(receivedKid)

  logger.log("Got key from cache", { key })
  const pem = jwkToPem(key)

  logger.log("Created pem from jwk")

  let payload: jwt.JwtPayload

  try {
    const verified = jwt.verify(signature, pem)

    if (typeof verified === "string") {
      payload = JSON.parse(verified)
    } else {
      payload = verified
    }

    logger.log("Got verified payload from signature")
  } catch (err) {
    logger.log("Could not verify signature with public key")
    return { isVerified: false }
  }

  const { exp } = payload

  if (!exp) {
    logger.log("No exp property")
    return { isVerified: false }
  }

  const signatureExpiry = new Date(exp * 1000)

  if (signatureExpiry < new Date()) {
    logger.log("exp less than current date")
    return { isVerified: false }
  }

  return { isVerified: true, payload }
}