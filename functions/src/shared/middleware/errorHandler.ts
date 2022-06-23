import { HttpStatusCode } from "../utils/errors";
import { ValidationError } from "express-json-validator-middleware";
import { logger } from "firebase-functions/v1";

export const errorHandler = (err, req, res, next) => {

  if (err instanceof ValidationError) {
    // Handle the error
    const { validationErrors } = err
    logger.error("Got validation errors", validationErrors)

    let errorMessage

    for (const location of ["body", "query", "params"]) {
      const errors = validationErrors[location]

      if (!errors || errors.length === 0) { continue }

      const error = errors[0]
      const { dataPath, message } = error

      if (dataPath) {
        errorMessage = `${dataPath.slice(1)} ${message} in ${location}`
      } else {
        errorMessage = `${message} in ${location}`
      }
    }

    return res.status(400).json({ message: errorMessage });
  } else {
    if (!err.statusCode) {
      err.statusCode = HttpStatusCode.INTERNAL_SERVER_ERROR;
    }

    // err.message will often be long/descriptive - not suitable for users to see but we should log

    logger.error("Non-validation related error", {
      message: err.message,
      response: err.response,
      statusCode: err.statusCode,
      fullError: err
    })

    // Return a message suitable for a user to see
    return res
      .status(err.statusCode)
      .json({ message: err.clientMessage || "An error occured" });
  }
};
