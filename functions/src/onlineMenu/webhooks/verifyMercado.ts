import axios from "axios";
import * as jwt from "jsonwebtoken"
import * as jwkToPem from "jwk-to-pem";
import sha256 = require("sha256");
import LoggingController from "../../shared/utils/loggingClient";

const keyCache = new Map()

export const verifyMercado = async (req, res, next) => {
  const logger = new LoggingController("Verifying Mercado webhook")

  const errorRes = res.status(403).send("Unauthorized");

  const signature = req.headers["mcp-signature"]

  if (!signature) {
    logger.log("No signature found")
    return errorRes
  }

  const decoded = jwt.decode(signature, { complete: true })
  const receivedKid = decoded.header.kid

  logger.log("Got kid from signature", {}, { receivedKid })

  if (!keyCache.has(receivedKid)) {
    logger.log("Kid not in cache, retrieving")
    const configRes = await axios.get(`${process.env.BASE_SERVER_URL}/clientApi/.well-known/config`)
    const { jwksUrl } = configRes.data
    const jwksRes = await axios.get(jwksUrl)
    logger.log("Got JWKS", {}, jwksRes.data)
    const { keys } = jwksRes.data

    for (const key of keys) {
      const kid = key.kid
      keyCache[kid] = key
    }

    if (!keyCache.has(receivedKid)) {
      logger.log("Kid not in jwks")
      return errorRes
    }
  }

  const key = keyCache[receivedKid]
  const pem = jwkToPem(key)

  let payload: jwt.JwtPayload

  try {
    const verified = jwt.verify(signature, pem)

    if (typeof verified === "string") {
      payload = JSON.parse(verified)
    } else {
      payload = verified
    }
  } catch (err) {
    logger.log("Could not verify signature with public key")
    return errorRes
  }

  logger.log("Verified signature", {}, { payload })

  const bodyString = JSON.stringify(req.body)
  const bodyHash = sha256(bodyString)

  if (bodyHash !== payload.body_sha_256) { 
    logger.log("Body hash mismatch")
    return errorRes
  }

  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
  const { iat } = payload

  if (!iat) { 
    logger.log("No iat property")
    return errorRes
  }

  const signatureIssuedAt = new Date(iat)

  if (signatureIssuedAt < fiveMinutesAgo) {
    logger.log("iat more than 5 mins ago")
    return errorRes
  }

  next()
}