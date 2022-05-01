import { firestore } from "firebase-admin";
import Collection from "../../shared/enums/Collection";
import OrderStatus from "../../shared/enums/OrderStatus";
import { PaymentIntentStatus } from "../../shared/enums/PaymentIntentStatus";
import { WebhookCode } from "../../shared/enums/WebhookCode";
import { db } from "../../shared/utils/admin";

export const handleMercadoPaymentUpdate = async (req, res, next) => {
  try {
    const { paymentIntentId, paymentAttemptId, webhookCode, paymentIntentStatus } = req.body

    if (webhookCode !== WebhookCode.PAYMENT_INTENT_UPDATE || paymentIntentStatus !== PaymentIntentStatus.SUCCESSFUL) {
      console.log("Wrong webhookCode or paymentIntentStatus")
      return res.sendStatus(200)
    }

    const snapshot = await db()
      .collection(Collection.ORDER)
      .where("mercado.paymentIntentId", "==", paymentIntentId)
      .limit(1)
      .get()
    
    const orderDocs = snapshot.docs

    if (orderDocs.length === 0) {
      console.log("No order found")
      return res.sendStatus(200)
    }

    const orderId = orderDocs[0].id
    const orderStatusMap = {
      [PaymentIntentStatus.SUCCESSFUL]: OrderStatus.PAID,
      [PaymentIntentStatus.CANCELLED]: OrderStatus.ABANDONED
    }

    const orderStatus = orderStatusMap[paymentIntentStatus]

    await db()
      .collection(Collection.ORDER)
      .doc(orderId)
      .update({
        status: orderStatus,
        paidAt: firestore.FieldValue.serverTimestamp(),
        mercado: {
          paymentAttemptId
        }
      })
    
    res.sendStatus(200)
  } catch (err) {
    res.sendStatus(500);
  }
}