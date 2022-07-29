import * as functions from "firebase-functions"
import mainApp from "./main/mainApp"
import { cronFunction } from "./cron/cron"
import { notifyIfPublished } from "./firestore/notifyIfPublished"
import { backupFirestore } from "./cron/backupFirestore"

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
      "CREZCO_API_KEY",
      "STRIPE_CLIENT_SECRET",
      "STRIPE_PAYMENT_WEBHOOK_SECRET",
      "IP_GEOLOCATION_API_KEY",
      "GOOGLE_MAPS_API_KEY",
      "STRIPE_WEBHOOK_SECRETS"
    ],
    minInstances: envProjectId === "mercadopay" ? 1 : 0,
  })
  .https.onRequest(mainApp)

export const cron = euFunctions
  .runWith({ secrets: ["SERVICE_ACCOUNT"] })
  .pubsub.schedule("every 10 minutes")
  .onRun(cronFunction)

export const backup = euFunctions
  .runWith({ secrets: ["SERVICE_ACCOUNT"] })
  .pubsub.schedule("every 24 hours")
  .onRun(backupFirestore)

export const eventCreate = euFunctions.runWith({ secrets: ["SERVICE_ACCOUNT", "SENDGRID_API_KEY"] }).firestore.document('Event/{eventId}').onWrite((  change, context) => notifyIfPublished)