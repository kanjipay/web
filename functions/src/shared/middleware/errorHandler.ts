import { HttpError } from "../utils/errors"
import { ValidationError } from "express-json-validator-middleware"
import { logger } from "firebase-functions/v1"
const { ErrorReporting } = require("@google-cloud/error-reporting")

const errors = new ErrorReporting({ reportMode: "always" })

export const errorHandler = (err, req, res, next) => {
  if (err instanceof ValidationError) {
    // Handle the error
    const { validationErrors } = err;
    logger.error("ValidationError", validationErrors);

    let errorMessage: string;

    for (const location of ["body", "query", "params"]) {
      const errors = validationErrors[location];

      if (!errors || errors.length === 0) {
        continue
      }

      const error = errors[0];
      const { dataPath, message } = error;

      if (dataPath) {
        errorMessage = `${dataPath.slice(1)} ${message} in ${location}`;
      } else {
        errorMessage = `${message} in ${location}`;
      }
    }

    return res.status(400).json({ message: errorMessage })
  } else if (err instanceof HttpError) {
    logger.error("HttpError", {
      ...err.args,
      statusCode: err.statusCode,
      clientMessage: err.clientMessage,
    })

    // Return a message suitable for a user to see
    return res
      .status(err.statusCode)
      .json({ message: err.clientMessage || "An error occured" })
  } else {
    logger.error("Uncategorised error", err);
    // Report 500 servers error the Cloud Error Service
    errors.report(err)
    return res.status(500).json({ message: "An unexpected error occured" })
  }
}
