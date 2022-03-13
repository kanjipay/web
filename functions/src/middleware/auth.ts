import { auth } from "../admin"

export const checkFirebaseAuthToken = async (req, res, next) => {
  let idToken

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    idToken = req.headers.authorization.split("Bearer ")[1]
  } else {
    res.status(403).send("Unauthorized")
  }

  try {
    const decodedIdToken = await auth.verifyIdToken(idToken)
    req.user = decodedIdToken
    next()
    return
  } catch (err) {
    res.status(403).send("Unauthorized")
    return
  }
}