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
    this.next(err);
  };
}

// Generate instance of HTTPError and pass into next() when raising an error yourself
export class HttpError extends Error {
  clientMessage: string;
  args: any[];
  statusCode: number;

  constructor(
    statusCode,
    clientMessage = "An error occured",
    ...args: any[]
  ) {
    super(clientMessage);

    this.args = args
    this.clientMessage = clientMessage;
    this.statusCode = statusCode;
  }
}
