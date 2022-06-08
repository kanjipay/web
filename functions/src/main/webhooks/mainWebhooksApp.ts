import * as express from "express";
import { setCors } from "../../shared/utils/express";
import { handleCrezcoWebhook } from "./handleCrezcoWebhook";

const mainWebhooksApp = express()

setCors(mainWebhooksApp, true)

mainWebhooksApp.post("/crezco", handleCrezcoWebhook)

export default mainWebhooksApp