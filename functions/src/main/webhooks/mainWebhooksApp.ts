import * as express from "express"
import { setCors } from "../../shared/utils/express"
import { handleCrezcoWebhook } from "./handleCrezcoWebhook"
import { handleStripeAccountUpdate } from "./handleStripeAccountUpdate"
import { handleStripeWebhook } from "./handleStripeWebhook"
import { handleVonageWebhook } from "./handleVonageWebhook"

const mainWebhooksApp = express()

setCors(mainWebhooksApp, true)

mainWebhooksApp.post("/crezco", handleCrezcoWebhook)
mainWebhooksApp.post("/stripe", handleStripeWebhook)
mainWebhooksApp.post("/stripe-account-update", handleStripeAccountUpdate)
mainWebhooksApp.post("/vonage", handleVonageWebhook)

export default mainWebhooksApp
