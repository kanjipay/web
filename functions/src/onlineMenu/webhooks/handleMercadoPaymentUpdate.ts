import { firestore } from "firebase-admin";
import Collection from "../../shared/enums/Collection";
import OrderStatus from "../../shared/enums/OrderStatus";
import { PaymentIntentStatus } from "../../shared/enums/PaymentIntentStatus";
import { WebhookCode } from "../../shared/enums/WebhookCode";
import { db } from "../../shared/utils/admin";
import LoggingController from "../../shared/utils/loggingClient";

export const handleMercadoPaymentUpdate = async (req, res, next) => {
  try {
    const logger = new LoggingController("Mercado Payment Update")
    const { paymentIntentId, paymentAttemptId, webhookCode, paymentIntentStatus } = req.body

    logger.log("Receive body params", {
      paymentAttemptId,
      paymentIntentId,
      webhookCode,
      paymentIntentStatus
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

    const orderId = orderDocs[0].id

    logger.log("Fetched order", { orderId })

    const orderStatusMap = {
      [PaymentIntentStatus.SUCCESSFUL]: OrderStatus.PAID,
      [PaymentIntentStatus.CANCELLED]: OrderStatus.ABANDONED
    }

    const orderStatus = orderStatusMap[paymentIntentStatus]

    await db()
      .collection(Collection.ORDER)
      .doc(orderId)
      .set({
        status: orderStatus,
        paidAt: firestore.FieldValue.serverTimestamp(),
      }, { merge: true })

    logger.log("Updated order", { orderStatus })
    
    return res.sendStatus(200)
  } catch (err) {
    return res.sendStatus(500);
  }
}