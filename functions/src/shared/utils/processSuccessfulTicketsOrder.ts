import { firestore } from "firebase-admin"
import Collection from "../enums/Collection"
import { db } from "./admin"
import LoggingController from "./loggingClient"
import { v4 as uuid } from "uuid"
import { fetchDocument } from "./fetchDocument"
import { sendTicketReceipt, sendTicketSaleAlert } from "./sendEmail"
import { fetchDocumentsInArray } from "./fetchDocumentsInArray"
import { FieldPath } from "@google-cloud/firestore"

export async function processSuccessfulTicketsOrder(
  merchant,
  event,
  product,
  orderId: string,
  userId: string,
  quantity: number
) {

  const { id: merchantId, currency, customerFee } = merchant
  const { id: eventId, title: eventTitle, endsAt: eventEndsAt } = event
  const { id: productId, title: productTitle, price: productPrice } = product
  const logger = new LoggingController("processSuccessfulTicketsOrder")

  logger.log("Creating tickets", { quantity })

  const ticketIds = []
  const batch = db().batch()

  for (let i = 0; i < quantity; i++) {
    const ticketId = uuid()
    ticketIds.push(ticketId)

    const ticketData = {
      createdAt: firestore.FieldValue.serverTimestamp(),
      productId,
      eventId,
      eventEndsAt,
      merchantId,
      userId,
      orderId,
      wasUsed: false,
    }

    if (i == 0) {
      logger.log("Generated ticket data", {
        ticketData,
        quantity,
      })
    }

    const ticketRef = db().collection(Collection.TICKET).doc(ticketId)

    batch.set(ticketRef, ticketData)
  }

  const addTickets = batch.commit()

  const updateProduct = db()
    .collection(Collection.PRODUCT)
    .doc(productId)
    .update({
      soldCount: firestore.FieldValue.increment(quantity),
    })

  const [{ user }] = await Promise.all([
    fetchDocument(Collection.USER, userId),
    addTickets,
    updateProduct,
  ])

  const { firstName, lastName } = user
  const boughtAt = new Date()

  await sendTicketReceipt(
    merchant,
    event,
    product,
    user,
    quantity,
    ticketIds,
  )

  const customerName = firstName + " " + lastName
  const membersToAlert = await db()
    .collection(Collection.MEMBERSHIP)
    .where("merchantId", "==", merchantId)
    .where("emailAlert", "==", true)
    .get()
  const userIds = membersToAlert.docs.map((doc) => doc.data().userId)
  const userDocs = await fetchDocumentsInArray(
    db().collection(Collection.USER),
    FieldPath.documentId(),
    userIds
  )
  const userEmails = userDocs.map((doc) => doc.email)
  logger.log("users to alert", userIds)
  if (userEmails.length > 0) {
    await sendTicketSaleAlert(
      userEmails,
      customerName,
      eventTitle,
      productTitle,
      productPrice,
      quantity,
      boughtAt,
      currency,
      ticketIds,
      customerFee
    )
    logger.log("alert emails sent")
  }
  return
}
