export const verifyDomain = (req, res, next) => {
  const { origin } = req.headers;

  if (process.env.ENVIRONMENT === "PROD" && origin !== process.env.CLIENT_URL) {
    res.status(403).send("Unauthorized");
  } else {
    next();
  }
};
