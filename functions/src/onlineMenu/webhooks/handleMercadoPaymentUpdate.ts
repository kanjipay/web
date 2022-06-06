import { firestore } from "firebase-admin";
import Collection from "../../shared/enums/Collection";
import OrderStatus from "../../shared/enums/OrderStatus";
import { PaymentIntentStatus } from "../../shared/enums/PaymentIntentStatus";
import { WebhookCode } from "../../shared/enums/WebhookCode";
import { db } from "../../shared/utils/admin";
import LoggingController from "../../shared/utils/loggingClient";
import { OrderType } from "../../shared/enums/OrderType";
import { PaymentIntentCancelReason } from "../../shared/enums/PaymentIntentCancelReason";
import { processSuccessfulTicketsOrder } from "../utils/processSuccessfulTicketsOrder";

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
      userId,
      currency,
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
    }

    const orderUpdate = {
      status: orderStatus
    }

    const promises = []

    if (type === OrderType.TICKETS) {
      const { productId, eventId, eventEndsAt, quantity } = orderItems[0]

      promises.push(
        db()
          .collection(Collection.PRODUCT)
          .doc(productId)
          .update({
            reservedCount: firestore.FieldValue.increment(-quantity)
          })
      )

      if (orderStatus === OrderStatus.PAID && !wereTicketsCreated) {
        orderUpdate["wereTicketsCreated"] = true

        const orderItem = orderItems[0]

        promises.push(processSuccessfulTicketsOrder(
          merchantId,
          eventId,
          orderItem.eventTitle,
          productId,
          orderItem.title,
          orderItem.price,
          orderId,
          userId,
          eventEndsAt,
          currency,
          quantity
        ))
      }
    }

    orderUpdate["updatedAt"] = firestore.FieldValue.serverTimestamp()

    promises.push(
      db()
        .collection(Collection.ORDER)
        .doc(orderId)
        .update(orderUpdate)
    )

    await Promise.all(promises)

    logger.log("Updated order", { orderStatus })
    
    return res.sendStatus(200)
  } catch (err) {
    return res.sendStatus(500);
  }
}