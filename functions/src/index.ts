import * as functions from "firebase-functions"
import mainApp from "./main/mainApp"
import { cronFunction } from "./cron/cron"
import { notifyIfPublished } from "./firestore/notifyIfPublished"
import { backupFirestore } from "./cron/backupFirestore"
import { retargetOrders } from "./cron/retargetingEmail"
import applePayApp from "./applePayApp"

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
    ],
    minInstances: envProjectId === "mercadopay" ? 1 : 0,
  })
  .https.onRequest(mainApp)

export const cron10m = euFunctions
  .runWith({ secrets: ["SERVICE_ACCOUNT"] })
  .pubsub.schedule("every 10 minutes")
  .onRun(cronFunction)

export const cronBackup = euFunctions
  .runWith({ secrets: ["SERVICE_ACCOUNT"] })
  .pubsub.schedule("0 1 * * *")
  .timeZone('Europe/London')
  .onRun(backupFirestore)

export const cronMarketing = euFunctions
  .runWith({ secrets: ["SERVICE_ACCOUNT", "SENDGRID_API_KEY"] })
  .pubsub.schedule("0 11 * * *")
  .timeZone('Europe/London')
  .onRun(retargetOrders)


export const eventCreate = euFunctions
  .runWith({ secrets: ["SERVICE_ACCOUNT", "SENDGRID_API_KEY"] })
  .firestore.document('Event/{eventId}')
  .onWrite(notifyIfPublished)

export const applePay = functions
  .region("us-central1")
  .runWith({ secrets: ["APPLE_PAY_VERIFICATION"] })
  .https.onRequest(applePayApp)