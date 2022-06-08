import { firestore } from "firebase-admin";
import { processSuccessfulTicketsOrder } from "../../onlineMenu/utils/processSuccessfulTicketsOrder";
import Collection from "../../shared/enums/Collection";
import OrderStatus from "../../shared/enums/OrderStatus";
import { OrderType } from "../../shared/enums/OrderType";
import PaymentAttemptStatus from "../../shared/enums/PaymentAttemptStatus";
import { db } from "../../shared/utils/admin";
import { fetchDocument } from "../../shared/utils/fetchDocument";
import LoggingController from "../../shared/utils/loggingClient";
import { verifyMercadoSignature } from "../../shared/utils/verifyMercadoSignature";

const crezcoPaymentStatuses = {
  PaymentCompleted: PaymentAttemptStatus.SUCCESSFUL,
  PaymentPending: PaymentAttemptStatus.PENDING,
  PaymentFailed: PaymentAttemptStatus.FAILED
}

export const handleCrezcoWebhook = async (req, res, next) => {
  try {
    const loggingClient = new LoggingController("Crezco Webhook");
    loggingClient.log("Handing crezco payment update", { payload: JSON.stringify(req.body[0]) })

    const signature = req.body[0].partnerMetadata?.signature

    if (!signature) {
      loggingClient.log("signature not present in metadata")
      return res.sendStatus(200)
    }

    const { isVerified, payload } = await verifyMercadoSignature(signature)

    if (!isVerified) {
      loggingClient.log("signature could not be verified")
      return res.sendStatus(200)
    }

    const { eventType, metadata } = req.body[0]
    const { payDemandId } = metadata

    loggingClient.log("Got Crezco data", {}, { eventType, payDemandId })

    const { paymentAttemptId } = payload

    loggingClient.log("Got payment attempt id", {}, { paymentAttemptId })

    if (!eventType || !(eventType in crezcoPaymentStatuses)) {
      loggingClient.log("Crezco eventType undefined or not recognised", { eventType })
      return res.sendStatus(200)
    }

    const paymentAttemptStatus = crezcoPaymentStatuses[eventType]

    if (paymentAttemptStatus === PaymentAttemptStatus.PENDING) { 
      return res.sendStatus(200)
    }

    const { paymentAttempt, paymentAttemptError } = await fetchDocument(Collection.PAYMENT_ATTEMPT, paymentAttemptId)

    if (paymentAttemptError) {
      loggingClient.log("An error occured", { message: paymentAttemptError.message })
      return res.sendStatus(200)
    }

    const { orderId } = paymentAttempt;
    const { order, orderError } = await fetchDocument(Collection.ORDER, orderId, { status: OrderStatus.PENDING })

    if (orderError) {
      loggingClient.log("An error occured", { message: orderError.message })
      return res.sendStatus(200)
    }

    const updatePaymentAttempt = db()
      .collection(Collection.PAYMENT_ATTEMPT)
      .doc(paymentAttemptId)
      .update({
        status: paymentAttemptStatus,
      })

    const promises: Promise<any>[] = [updatePaymentAttempt]

    if (paymentAttemptStatus === PaymentAttemptStatus.SUCCESSFUL) {
      const { type, orderItems, wereTicketsCreated, merchantId, userId, currency } = order

      const orderUpdate = { 
        status: OrderStatus.PAID,
        paidAt: firestore.FieldValue.serverTimestamp()
      }

      if (type === OrderType.TICKETS && !wereTicketsCreated) {
        const { productId, eventId, eventEndsAt, quantity } = orderItems[0]

        const updateProduct = db()
          .collection(Collection.PRODUCT)
          .doc(productId)
          .update({
            reservedCount: firestore.FieldValue.increment(-quantity)
          })

        promises.push(updateProduct)

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

      const updateOrder = db()
        .collection(Collection.ORDER)
        .doc(orderId)
        .update(orderUpdate)

      promises.push(updateOrder)
    }

    await Promise.all(promises)

    return res.sendStatus(200)
  } catch (err) {
    next(err)
  }
}