import { HttpStatusCode } from "../utils/errors";
import { ValidationError } from "express-json-validator-middleware";

export const errorHandler = (err, req, res, next) => {
  if (err instanceof ValidationError) {
    // Handle the error
    console.log(err.validationErrors)
    res.status(400).json({ error: err.message });
    next();
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
