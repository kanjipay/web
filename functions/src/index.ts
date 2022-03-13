import * as functions from 'firebase-functions'
import apiApp from "./api/api"
import webhookApp from "./webhook/webhook"

const REGION = "europe-west2"

export const api = functions.region(REGION).https.onRequest(apiApp)
export const webhook = functions.region(REGION).https.onRequest(webhookApp)

export const status = functions.region(REGION).https.onRequest((req, res) => {
  console.log("Healthcheck")
  res.sendStatus(200)
})