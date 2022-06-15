import * as express from "express";
import { setCors } from "../../shared/utils/express";
import { handleCrezcoWebhook } from "./handleCrezcoWebhook";
import { handleStripeWebhook } from "./handleStripeWebhook";

const mainWebhooksApp = express()

setCors(mainWebhooksApp, true)

mainWebhooksApp.post("/crezco", handleCrezcoWebhook)
mainWebhooksApp.post("/stripe", handleStripeWebhook)

export default mainWebhooksApp