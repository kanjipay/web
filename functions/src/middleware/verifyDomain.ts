export const verifyDomain = (req, res, next) => {
  const { origin } = req.headers

  if (origin === process.env.CLIENT_URL || process.env.ENVIRONMENT !== "PROD") {
    next()
  } else {
    res.status(403).send("Unauthorized")
  }
}