const {ErrorReporting} = require('@google-cloud/error-reporting');
const errors = new ErrorReporting();

export class InvalidRequestValueError extends Error {
  constructor(fieldName, location, expectedType, value) {
    super(
      `Field "${fieldName}" in ${location} was expected to be of type "${expectedType}" but was ${typeof value}. Value was ${value}`
    );
  }
}

export enum HttpStatusCode {
  BAD_REQUEST = 400,
  UNAUTHORIZED = 403,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500,
}

// Generate instance of ErrorHandler and call handle when passed an error from somewhere else
export class ErrorHandler {
  statusCode: any;
  next: any;
  clientMessage: string;
  constructor(statusCode, next, clientMessage = "Something went wrong") {
    this.statusCode = statusCode;
    this.next = next;
    this.clientMessage = clientMessage;
  }

  handle = (err) => {
    err.statusCode = this.statusCode;
    err.clientMessage = this.clientMessage;
    if (this.statusCode == HttpStatusCode.INTERNAL_SERVER_ERROR) {
      // Report 500 servers error the Cloud Error Service
      errors.report(err);
    }
    this.next(err);
  };
}

// Generate instance of HTTPError and pass into next() when raising an error yourself
export class HttpError extends Error {
  clientMessage: string;
  statusCode: number;

  constructor(
    statusCode,
    clientMessage = "An error occured",
    message = undefined
  ) {
    super(message || clientMessage);

    this.clientMessage = clientMessage;
    this.statusCode = statusCode;
  }
}
