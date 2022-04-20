export const verifyMercado = async (req, res, next) => {
  const errorRes = res.status(403).send("Unauthorized");
  const isVerified = true

  if (!isVerified) {
    return errorRes
  }

  next()
}