import { logger } from "firebase-functions/v1";

export const logRequest = (req, res, next) => {
  const { body, params, query, user, originalUrl: url, method } = req;
  logger.log("Request received", { url, body, params, query, user, method });

  next();
};
