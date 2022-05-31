import * as functions from "firebase-functions";
import internalApp from "./internal/internalApp";
import clientApiApp from "./clientApi/clientApiApp";
import onlineMenuApp from "./onlineMenu/onlineMenuApp";
import { handleKeepAwake } from "./keepAwake";
import { Express } from "express"

function getHttpFunction(app: Express, secrets: string[]) {
  return functions
    .region("europe-west2")
    .runWith({ secrets })
    .https.onRequest(app)
}

export const internal = getHttpFunction(internalApp, [
  "SERVICE_ACCOUNT",
  "MONEYHUB_CLIENT_ID",
  "MONEYHUB_CLIENT_SECRET",
  "MONEYHUB_PRIVATE_JWKS",
  "JWKS_PRIVATE_KEY",
  "SENDGRID_API_KEY",
  "CREZCO_API_KEY",
])

export const clientApi = getHttpFunction(clientApiApp, [
  "SERVICE_ACCOUNT",
  "JWKS_PUBLIC_KEY",
  "SENDGRID_API_KEY",
])

export const onlineMenu = getHttpFunction(onlineMenuApp, [
  "SERVICE_ACCOUNT",
  "MERCADO_CLIENT_ID",
  "MERCADO_CLIENT_SECRET",
  "SENDGRID_API_KEY",
])

export const keepAwake = functions
  .region("europe-west2")
  .pubsub.schedule("every 20 minutes")
  .onRun(handleKeepAwake)
