import Environment from "../enums/Environment";

export const verifyDomain = (req, res, next) => {
  const { origin } = req.headers;

  const strictEnvironments: string[] = [Environment.PROD, Environment.STAGING]

  if (strictEnvironments.includes(process.env.ENVIRONMENT) && origin !== process.env.CLIENT_URL) {
    res.status(403).send("Unauthorized");
  } else {
    next();
  }
};
