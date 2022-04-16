import { HttpError, HttpStatusCode } from "../utils/errors";

export class RequestValidator {
  requiredFields: string[];
  location: string;

  constructor(requiredFields, location) {
    this.requiredFields = requiredFields;
    this.location = location;
  }

  validate = (req, res, next) => {
    let obj;

    switch (this.location) {
      case "body":
        obj = req.body;
        break;
      case "params":
        obj = req.params;
        break;
      case "headers":
        obj = req.header;
        break;
      default:
        throw new HttpError(HttpStatusCode.INTERNAL_SERVER_ERROR);
    }

    if (!obj) {
      const clientMessage = `${this.location} was expected on the request but not found`;
      throw new HttpError(HttpStatusCode.BAD_REQUEST, clientMessage);
    }

    for (const fieldName in this.requiredFields) {
      const expectedType = this.requiredFields[fieldName];

      if (!(fieldName in obj)) {
        const clientMessage = `Field "${fieldName}" expected to be in ${this.location} but not present`;
        throw new HttpError(HttpStatusCode.BAD_REQUEST, clientMessage);
      }

      const value = obj[fieldName];

      if (typeof value !== expectedType) {
        const clientMessage = `Field "${fieldName}" in ${
          this.location
        } was expected to be of type "${expectedType}" but was ${typeof value}. Value was ${value}`;
        throw new HttpError(HttpStatusCode.BAD_REQUEST, clientMessage);
      }
    }

    next();
  };
}
