import * as express from "express"
import { setCors } from "../../shared/utils/express"
import { handleCrezcoWebhook } from "./handleCrezcoWebhook"
import { handleStripePaymentUpdate } from "./handleStripeWebhook"
import { handleVonageWebhook } from "./handleVonageWebhook"

const mainWebhooksApp = express()

setCors(mainWebhooksApp, true)

mainWebhooksApp.post("/crezco", handleCrezcoWebhook)
mainWebhooksApp.post("/stripe", handleStripePaymentUpdate(true))
mainWebhooksApp.post("/stripe-payment-update", handleStripePaymentUpdate(false))
mainWebhooksApp.post("/vonage", handleVonageWebhook)

export default mainWebhooksApp
