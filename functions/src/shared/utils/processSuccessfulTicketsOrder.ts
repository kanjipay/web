import { firestore } from "firebase-admin"
import Collection from "../enums/Collection"
import { db } from "./admin"
import LoggingController from "./loggingClient"
import { v4 as uuid } from "uuid"
import { fetchDocument } from "./fetchDocument"
import { sendTicketReceipt, sendTicketSaleAlert } from "./sendEmail"
import { fetchDocumentsInArray } from "./fetchDocumentsInArray"
import { FieldPath } from "@google-cloud/firestore"
import { createGooglePassUrl, GoogleTicketDetail } from "./googleWallet"
import * as base64 from "base-64"


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
  const googleTicketDetails = []
  const header = `order ${orderId}`
  const body = `order ${orderId}`
  const batch = db().batch()
  const {user} = await fetchDocument(Collection.USER, userId)
  const {firstName, lastName} = user
  const ticketHolderName = firstName + ' ' + lastName
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
    const ticketDetail: GoogleTicketDetail = {
      ticketId,
      eventId,
      header,
      body,
      ticketHolderName
    }
    googleTicketDetails.push(ticketDetail)
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

  await Promise.all([
    addTickets,
    updateProduct,
  ])
  const boughtAt = new Date()
  const credentials = JSON.parse(base64.decode(process.env.SERVICE_ACCOUNT))
  const classId = 'mercado'
  const issuerId = '3388000000022129284'
  const googlePassUrl = await createGooglePassUrl(credentials, classId, issuerId, googleTicketDetails)
  console.log('google pass url')
  console.log(googlePassUrl)
  await db()
    .collection(Collection.ORDER)
    .doc(orderId)
    .update({
      googlePassUrl
    })  

  await sendTicketReceipt(
    merchant,
    event,
    product,
    user,
    quantity,
    ticketIds,
    googlePassUrl,
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
