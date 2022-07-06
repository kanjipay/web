import { v4 as uuid } from "uuid"
import * as functions from "firebase-functions"

//Whenever a function is called, initialize a new Logging Controller
//You can then use the methods to log events with different severities
//You can log event data as a one off or add additional process information
//which will be included in all future log method calls.
export default class LoggingController {
  process
  persistentData

  constructor(process: string) {
    const correlationId = uuid()
    const processStartTime = new Date()
    this.persistentData = {
      correlationId,
      process,
      processStartTime,
    }
  }

  enrichProcessData(additionalPersistantData: object) {
    this.persistentData = Object.assign(
      {},
      this.persistentData,
      additionalPersistantData
    )
  }

  createLogBody(eventData: object) {
    eventData["eventTime"] = new Date()
    return Object.assign({}, this.persistentData, eventData)
  }

  log(
    eventName: string,
    eventData: object = {},
    additionalPersistantData: object = {}
  ) {
    this.enrichProcessData(additionalPersistantData)
    const eventBody = this.createLogBody(eventData)
    functions.logger.log(eventName, eventBody)
  }

  warn(
    eventName: string,
    eventData: object = {},
    additionalPersistantData: object = {}
  ) {
    this.enrichProcessData(additionalPersistantData)
    const eventBody = this.createLogBody(eventData)
    functions.logger.warn(eventName, eventBody)
  }

  info(
    eventName: string,
    eventData: object = {},
    additionalPersistantData: object = {}
  ) {
    this.enrichProcessData(additionalPersistantData)
    const eventBody = this.createLogBody(eventData)
    functions.logger.info(eventName, eventBody)
  }

  error(
    eventName: string,
    eventData: object = {},
    additionalPersistantData: object = {}
  ) {
    this.enrichProcessData(additionalPersistantData)
    const eventBody = this.createLogBody(eventData)
    functions.logger.error(eventName, eventBody)
  }
}
