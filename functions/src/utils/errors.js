import { HttpsError } from "firebase-functions/v1/https";

export class InvalidRequestValueError extends Error {
  constructor(fieldName, location, expectedType, value) {
    super(`Field "${fieldName}" in ${location} was expected to be of type "${expectedType}" but was ${typeof value}. Value was ${value}`)
  }
}

export class HttpStatusCode {
  static BAD_REQUEST = 400
  static UNAUTHORIZED = 403
  static NOT_FOUND = 404
  static INTERNAL_SERVER_ERROR = 500
}

// Generate instance of ErrorHandler and call handle when passed an error from somewhere else
export class ErrorHandler {
  constructor(statusCode, next, clientMessage) {
    this.statusCode = statusCode
    this.next = next
    this.clientMessage = clientMessage
  }

  handle = (err) => {
    err.statusCode = this.statusCode
    err.clientMessage = this.clientMessage
    this.next(err)
  }
}

// Generate instance of HTTPError and pass into next() when raising an error yourself
export class HttpError extends Error {
  constructor(statusCode, clientMessage, message) {
    super(message || clientMessage)

    this.clientMessage = clientMessage
    this.statusCode = statusCode
  }
}