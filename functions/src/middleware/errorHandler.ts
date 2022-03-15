import { HttpStatusCode } from "../utils/errors";

export const errorHandler = (err, req, res, next) => {
  if (!err.statusCode) {
    err.statusCode = HttpStatusCode.INTERNAL_SERVER_ERROR;
  }

  // err.message will often be long/descriptive - not suitable for users to see but we should log
  console.log(err.message);

  // Return a message suitable for a user to see
  return res
    .status(err.statusCode)
    .json({ error: err.clientMessage || "An error occured" });
};
