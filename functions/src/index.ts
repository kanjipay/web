import * as functions from "firebase-functions"
import mainApp from "./main/mainApp"
import { cronFunction, cronFunctionDaily } from "./cron/cron"
import applePayApp from "./applePayApp"
import { onEventWrite } from "./firestore/onEventWrite"

const envProjectId = JSON.parse(process.env.FIREBASE_CONFIG).projectId
const euFunctions = functions.region("europe-west2")

export const main = euFunctions
  .runWith({
    secrets: [
      "SERVICE_ACCOUNT",
      "MONEYHUB_CLIENT_ID",
      "MONEYHUB_CLIENT_SECRET",
      "MONEYHUB_PRIVATE_JWKS",
      "JWKS_PRIVATE_KEY",
      "JWKS_PUBLIC_KEY",
      "SENDGRID_API_KEY",
      "APPLE_WALLET_CERT",
      "APPLE_WALLET_PRIVATE_KEY",
      "APPLE_WALLET_PASSWORD",
      "CREZCO_API_KEY",
      "STRIPE_CLIENT_SECRET",
      "IP_GEOLOCATION_API_KEY",
      "GOOGLE_MAPS_API_KEY",
      "STRIPE_WEBHOOK_SECRETS",
      "GOOGLE_WALLET_ISSUER_ID"
    ],
    minInstances: envProjectId === "mercadopay" ? 1 : 0,
  })
  .https.onRequest(mainApp)

export const cron10m = euFunctions
  .runWith({ secrets: ["SERVICE_ACCOUNT"] })
  .pubsub.schedule("every 10 minutes")
  .onRun(cronFunction)

export const cronDaily = euFunctions
  .runWith({ secrets: ["SERVICE_ACCOUNT", "SENDGRID_API_KEY"] })
  .pubsub.schedule("0 11 * * *")
  .timeZone('Europe/London')
  .onRun(cronFunctionDaily)


export const eventWrite = euFunctions
  .runWith({ secrets: ["SERVICE_ACCOUNT", "SENDGRID_API_KEY", "GOOGLE_WALLET_ISSUER_ID"] })
  .firestore.document('Event/{eventId}')
  .onWrite(onEventWrite)

export const applePay = functions
  .region("us-central1")
  .runWith({ secrets: ["APPLE_PAY_VERIFICATION"] })
  .https.onRequest(applePayApp)