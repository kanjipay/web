import * as functions from "firebase-functions";
import internalApp from "./internal/internalApp";
import clientApiApp from "./clientApi/clientApiApp";
import onlineMenuApp from "./onlineMenu/onlineMenuApp";
import { Express } from "express"
import { db } from "./shared/utils/admin";
import Collection from "./shared/enums/Collection";
import OrderStatus from "./shared/enums/OrderStatus";
import { OrderType } from "./shared/enums/OrderType";
import { firestore } from "firebase-admin";
import LoggingController from "./shared/utils/loggingClient";
import { addMinutes } from "date-fns";
import mainApp from "./main/mainApp";

const envProjectId = JSON.parse(process.env.FIREBASE_CONFIG).projectId

function getHttpFunction(app: Express, secrets: string[]) {
  return functions
    .region("europe-west2")
    .runWith({ 
      secrets,
      minInstances: envProjectId === "mercadopay" ? 1 : 0
    })
    .https.onRequest(app)
}

export const main = getHttpFunction(mainApp, [
  "SERVICE_ACCOUNT",
  "MONEYHUB_CLIENT_ID",
  "MONEYHUB_CLIENT_SECRET",
  "MONEYHUB_PRIVATE_JWKS",
  "JWKS_PRIVATE_KEY",
  "SENDGRID_API_KEY",
  "CREZCO_API_KEY",
])

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

export const cron = functions
  .region("europe-west2")
  .runWith({ secrets: ["SERVICE_ACCOUNT"] })
  .pubsub.schedule("every 10 minutes")
  .onRun(async context => {
    try {
      const logger = new LoggingController("Cron function")

      logger.log("Fetching pending ticket orders")

      const tenMinutesAgo = addMinutes(new Date(), -10)

      const snapshot = await db()
        .collection(Collection.ORDER)
        .where("type", "==", OrderType.TICKETS)
        .where("wereTicketsCreated", "==", false)
        .where("status", "==", OrderStatus.PENDING)
        .where("createdAt", "<", tenMinutesAgo)
        .get()

      const orders: any[] = snapshot.docs.map(doc => {
        return { id: doc.id, ...doc.data() }
      })

      logger.log("Got orders", { orderCount: orders.length })

      if (orders.length === 0) {
        return
      }

      const batch = db().batch()

      for (const order of orders) {
        const { productId, quantity } = order.orderItems[0]

        const orderRef = db().collection(Collection.ORDER).doc(order.id)
        const productRef = db().collection(Collection.PRODUCT).doc(productId)
        batch.update(orderRef, { status: OrderStatus.ABANDONED })
        batch.update(productRef, { reservedCount: firestore.FieldValue.increment(-quantity) })
      }

      await batch.commit()

      logger.log("Updates complete")

      return
    } catch (err) {
      console.log(err)
    }
    
  })
