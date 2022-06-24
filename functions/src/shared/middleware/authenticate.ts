import { auth } from "../utils/admin";

export const authenticate = async (req, res, next) => {
  let idToken: string;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    idToken = req.headers.authorization.split("Bearer ")[1];
  } else {
    res.status(403).send("Unauthorized");
    return
  }

  try {
    const decodedIdToken = await auth().verifyIdToken(idToken);
    console.log(decodedIdToken)
    const { uid, email, name } = decodedIdToken
    req.user = { id: uid, email, name };
    next();
  } catch (err) {
    res.status(403).send("Unauthorized");
  }
};
