import { firestore } from "firebase-admin";
import Collection from "../enums/Collection";
import { db } from "./admin";
import LoggingController from "./loggingClient";
import { v4 as uuid } from "uuid";
import { fetchDocument } from "./fetchDocument";
import { sendTicketReceipt } from "./sendEmail";

export async function processSuccessfulTicketsOrder(
  merchantId: string,
  eventId: string,
  eventTitle: string,
  productId: string,
  productTitle: string,
  productPrice: number,
  orderId: string,
  userId: string,
  eventEndsAt,
  currency: string,
  quantity: number,
  customerFee: number
) {
  const logger = new LoggingController("processSuccessfulTicketsOrder");

  logger.log("Creating tickets", { quantity });

  const ticketIds = [];
  const batch = db().batch();

  for (let i = 0; i < quantity; i++) {
    const ticketId = uuid();
    ticketIds.push(ticketId);

    const ticketData = {
      createdAt: firestore.FieldValue.serverTimestamp(),
      productId,
      eventId,
      eventEndsAt,
      merchantId,
      userId,
      orderId,
      wasUsed: false,
    };

    if (i == 0) {
      logger.log("Generated ticket data", {
        ticketData,
        quantity,
      });
    }

    const ticketRef = db().collection(Collection.TICKET).doc(ticketId);

    batch.set(ticketRef, ticketData);
  }

  const addTickets = batch.commit();

  const updateProduct = db()
    .collection(Collection.PRODUCT)
    .doc(productId)
    .update({
      soldCount: firestore.FieldValue.increment(quantity),
    });

  const [{ user }] = await Promise.all([
    fetchDocument(Collection.USER, userId),
    addTickets,
    updateProduct,
  ]);

  const { email, firstName } = user;
  const boughtAt = new Date();

  await sendTicketReceipt(
    email,
    firstName,
    eventTitle,
    productTitle,
    productPrice,
    quantity,
    boughtAt,
    currency,
    ticketIds,
    customerFee
  );

  return;
}
