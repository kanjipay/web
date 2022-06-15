import { db } from "../../shared/utils/admin";
import Collection from "../../shared/enums/Collection";

import LoggingController from "../../shared/utils/loggingClient";

export const handleVonageWebhook = async (req, res, next) => {
  try {
    const loggingClient = new LoggingController("Vonage Webhook");
    loggingClient.log("Handing Vonage text message webhook", { payload: JSON.stringify(req.body) });
    const dbEntry = db().collection(Collection.PHONE).add(req.body)
    loggingClient.log("saved to DB", { dbEntry: JSON.stringify(dbEntry) });
    // todo send a comment
    // todo parse stop and deactive
    // todo check if number aready exists
    return res.sendStatus(200)
  } catch (err) {
    console.log(err)
    return res.sendStatus(200)
  }
}