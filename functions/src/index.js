import * as functions from 'firebase-functions'
import apiApp from "./api/api"
import webhookApp from "./webhook/webhook"

export const api = functions.https.onRequest(apiApp)
export const webhook = functions.https.onRequest(webhookApp)