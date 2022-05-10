import { firestore } from "firebase-admin";
import Collection from "../../shared/enums/Collection";
import OrderStatus from "../../shared/enums/OrderStatus";
import { PaymentIntentStatus } from "../../shared/enums/PaymentIntentStatus";
import { WebhookCode } from "../../shared/enums/WebhookCode";
import { db } from "../../shared/utils/admin";
import LoggingController from "../../shared/utils/loggingClient";
import { v4 as uuid } from "uuid"
import sha256 = require("sha256");
import { OrderType } from "../../shared/enums/OrderType";
import { PaymentIntentCancelReason } from "../../shared/enums/PaymentIntentCancelReason";

export const handleMercadoPaymentUpdate = async (req, res, next) => {
  try {
    const logger = new LoggingController("Mercado Payment Update")

    const { 
      paymentIntentId, 
      paymentAttemptId, 
      webhookCode, 
      paymentIntentStatus,
      cancelReason
    } = req.body

    logger.log("Receive body params", {
      paymentAttemptId,
      paymentIntentId,
      webhookCode,
      paymentIntentStatus,
      cancelReason
    })

    const validPaymentIntentStatuses = [
      PaymentIntentStatus.SUCCESSFUL,
      PaymentIntentStatus.CANCELLED
    ]

    if (webhookCode !== WebhookCode.PAYMENT_INTENT_UPDATE || !validPaymentIntentStatuses.includes(paymentIntentStatus)) {
      logger.log("Wrong webhookCode or paymentIntentStatus")
      return res.status(200).json({})
    }

    const snapshot = await db()
      .collection(Collection.ORDER)
      .where("mercado.paymentIntentId", "==", paymentIntentId)
      .limit(1)
      .get()
    
    const orderDocs = snapshot.docs

    if (orderDocs.length === 0) {
      logger.log("No order found")
      return res.status(200).json({})
    }

    const orderDoc = orderDocs[0]
    const orderId = orderDoc.id
    const {
      orderItems,
      type,
      merchantId,
      customerId,
      wereTicketsCreated
    } = orderDoc.data()

    logger.log("Fetched order", { orderId })

    let orderStatus: OrderStatus

    switch (paymentIntentStatus) {
      case PaymentIntentStatus.SUCCESSFUL:
        orderStatus = OrderStatus.PAID
        break;
      case PaymentIntentStatus.CANCELLED:
        switch (cancelReason) {
          case PaymentIntentCancelReason.USER:
            orderStatus = OrderStatus.ABANDONED
            break;
          case PaymentIntentCancelReason.TIMEOUT:
            orderStatus = OrderStatus.CANCELLED
            break;
        }
        break;
      case PaymentIntentStatus.PENDING:
        return res.sendStatus(200)
        break;
    }

    const orderUpdate = {
      status: orderStatus
    }

    if (type === OrderType.TICKETS) {
      const { productId, eventId, eventEndsAt, quantity } = orderItems[0]

      await db()
        .collection(Collection.PRODUCT)
        .doc(productId)
        .update({
          reservedCount: firestore.FieldValue.increment(-quantity)
        })

      if (orderStatus === OrderStatus.PAID && !wereTicketsCreated) {
        orderUpdate["wereTicketsCreated"] = true

        const addTicketPromises: Promise<firestore.WriteResult>[] = []
        const qrCodeSecret = process.env.QR_CODE_SECRET

        logger.log("Creating tickets", { quantity })

        for (let i = 0; i < quantity; i++) {

          const ticketId = uuid()
          const hash = sha256(ticketId + qrCodeSecret)

          logger.log("creating ticket with id " + ticketId)

          const ticketPromise = db()
            .collection(Collection.TICKET)
            .doc(ticketId)
            .set({
              createdAt: firestore.FieldValue.serverTimestamp(),
              productId,
              eventId,
              eventEndsAt,
              merchantId,
              customerId,
              orderId,
              hash
            })

          addTicketPromises.push(ticketPromise)
        }

        await Promise.all(addTicketPromises)

        const soldCountUpdate = {
          soldCount: firestore.FieldValue.increment(quantity)
        }

        await db()
          .collection(Collection.EVENT)
          .doc(eventId)
          .update(soldCountUpdate)

        await db()
          .collection(Collection.PRODUCT)
          .doc(productId)
          .update(soldCountUpdate)
      }
    }

    orderUpdate["updatedAt"] = firestore.FieldValue.serverTimestamp()

    await db()
      .collection(Collection.ORDER)
      .doc(orderId)
      .update(orderUpdate)

    logger.log("Updated order", { orderStatus })
    
    return res.sendStatus(200)
  } catch (err) {
    return res.sendStatus(500);
  }
}