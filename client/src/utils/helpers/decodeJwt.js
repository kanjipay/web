// The libraries for decoding jwts only work for node, not normal javascript, so need a helper function
export function decodeJwt(jwt) {
  const [header, payload] = jwt.split(".").slice(0, 2).map(e => JSON.parse(window.atob(e)))
  return { header, payload }
}

export function isExpired(jwt) {
  const { payload } = decodeJwt(jwt)
  const expirySecondsSinceEpoch = payload.exp

  if (!expirySecondsSinceEpoch) {
    return false
  }

  const expiryDate = new Date(expirySecondsSinceEpoch * 1000)
  const currDate = new Date(Date.now())

  return currDate > expiryDate
}