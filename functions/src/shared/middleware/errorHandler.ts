import { HttpStatusCode } from "../utils/errors";
import { ValidationError } from "express-json-validator-middleware";

export const errorHandler = (err, req, res, next) => {
  if (err instanceof ValidationError) {
    // Handle the error
    const { validationErrors } = err
    console.log
    console.log(validationErrors)

    let errorMessage

    for (const location of ["body", "query", "params"]) {
      const errors = validationErrors[location]

      if (!errors || errors.length === 0) {
        continue
      }

      const error = errors[0]
      const { dataPath, message } = error

      if (dataPath) {
        errorMessage = `${dataPath.slice(1)} ${message} in ${location}`
      } else {
        errorMessage = `${message} in ${location}`
      }
    }

    return res.status(400).json({ error: errorMessage });
    // next();
  } else {
    if (!err.statusCode) {
      err.statusCode = HttpStatusCode.INTERNAL_SERVER_ERROR;
    }

    // err.message will often be long/descriptive - not suitable for users to see but we should log
    console.log(err.message);

    // Return a message suitable for a user to see
    return res
      .status(err.statusCode)
      .json({ error: err.clientMessage || "An error occured" });
  }
  
};
