import axios from "axios";
import * as jwt from "jsonwebtoken"
import * as jwkToPem from "jwk-to-pem";
import { generateHash } from "../../shared/utils/createHash";

const keyCache = new Map()

export const verifyMercado = async (req, res, next) => {
  const errorRes = res.status(403).send("Unauthorized");

  const signature = req.headers["mcp-signature"]
  const decoded = jwt.decode(signature, { complete: true })
  const receivedKid = decoded.header.kid

  if (!keyCache.has(receivedKid)) {
    const configRes = await axios.get(`${process.env.BASE_SERVER_URL}/clientApi/.well-known/config`)
    const { jwksUrl } = configRes.data
    const jwksRes = await axios.get(jwksUrl)
    const { keys } = jwksRes.data

    for (const key of keys) {
      const kid = key.kid
      keyCache[kid] = key
    }

    if (!keyCache.has(receivedKid)) {
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
    return errorRes
  }

  const bodyString = JSON.stringify(req.body)
  const bodyHash = generateHash(bodyString)

  
  
  next()
}