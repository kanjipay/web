import { firestore } from "firebase-admin";
import { processSuccessfulTicketsOrder } from "../../shared/utils/processSuccessfulTicketsOrder";
import Collection from "../../shared/enums/Collection";
import OrderStatus from "../../shared/enums/OrderStatus";
import { OrderType } from "../../shared/enums/OrderType";
import PaymentAttemptStatus from "../../shared/enums/PaymentAttemptStatus";
import { db } from "../../shared/utils/admin";
import { fetchDocument } from "../../shared/utils/fetchDocument";

export async function processPaymentUpdate(paymentAttemptId: string, paymentAttemptStatus: PaymentAttemptStatus, orderId: string | null = null) {
  if (paymentAttemptStatus === PaymentAttemptStatus.PENDING) {
    return [true, null]
  }

  const updatePaymentAttempt = db()
    .collection(Collection.PAYMENT_ATTEMPT)
    .doc(paymentAttemptId)
    .update({
      status: paymentAttemptStatus
    })

  const promises: Promise<any>[] = [updatePaymentAttempt]

  if ([PaymentAttemptStatus.SUCCESSFUL, PaymentAttemptStatus.ACCEPTED].includes(paymentAttemptStatus)) {
    if (!orderId) {
      const { paymentAttempt, paymentAttemptError } = await fetchDocument(Collection.PAYMENT_ATTEMPT, paymentAttemptId)

      if (paymentAttemptError) {
        return [false, paymentAttemptError]
      }

      orderId = paymentAttempt.orderId
    }
    
    const { order, orderError } = await fetchDocument(Collection.ORDER, orderId)

    if (orderError) {
      return [false, orderError]
    }

    const { type, orderItems, wereTicketsCreated, merchantId, userId, currency, status, customerFee } = order

    // Only update the order if it's still pending
    if (status === OrderStatus.PENDING) {
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
          quantity,
          customerFee
        ))
      }

      const updateOrder = db()
        .collection(Collection.ORDER)
        .doc(orderId)
        .update(orderUpdate)

      promises.push(updateOrder)
    }
  }

  await Promise.all(promises)

  return [true, null]
}