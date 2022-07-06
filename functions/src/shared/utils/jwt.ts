import * as jwt from "jsonwebtoken"

export function isExpired(token: string) {
  const decoded = jwt.decode(token, { complete: true })
  let payload: jwt.JwtPayload

  if (typeof decoded === "string") {
    payload = JSON.parse(decoded)
  } else {
    payload = decoded
  }

  const expirySecondsSinceEpoch = payload.exp

  if (!expirySecondsSinceEpoch) {
    return false
  }

  const expiryDate = new Date(expirySecondsSinceEpoch * 1000)
  const currDate = new Date()

  return currDate < expiryDate
}
