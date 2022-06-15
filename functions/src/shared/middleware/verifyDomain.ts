import { isStrictEnvironment } from "../utils/isStrictEnvironment";

export const verifyDomain = (req, res, next) => {
  const { origin } = req.headers;

  if (isStrictEnvironment(process.env.ENVIRONMENT) && origin !== process.env.CLIENT_URL) {
    res.status(403).send("Unauthorized");
  } else {
    next();
  }
};
