export const authenticateClient = async (req, res, next) => {
  // This middleware should check for an access token in the auth header and verify it
  req.clientId = "abc"
  next()
}
