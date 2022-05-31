import axios from "axios";
import LoggingController from "../shared/utils/loggingClient";

export const handleKeepAwake = async context => {
  try {
    // Basically just need to call the status endpoint of all the other functions.

    const logger = new LoggingController("Running keep awake function")

    logger.log("Started keep awake function", {}, {
      baseUrl: process.env.BASE_SERVER_URL
    })

    const functionNames = ["internal", "clientApi", "onlineMenu"]

    const promises = functionNames.map(name => {
      const statusUrl = `${process.env.BASE_SERVER_URL}/${name}/status`
      return axios.get(statusUrl)
    })

    await Promise.all(promises)

    // TODO: listen for status response and send slack alert if something is down

    return null
  } catch (err) {
    console.log(JSON.stringify(err))
  }
}