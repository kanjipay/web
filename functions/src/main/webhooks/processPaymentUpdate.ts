import { firestore } from "firebase-admin"
import { processSuccessfulTicketsOrder } from "../../shared/utils/processSuccessfulTicketsOrder"
import Collection from "../../shared/enums/Collection"
import OrderStatus from "../../shared/enums/OrderStatus"
import { OrderType } from "../../shared/enums/OrderType"
import PaymentAttemptStatus from "../../shared/enums/PaymentAttemptStatus"
import { db } from "../../shared/utils/admin"
import { fetchDocument } from "../../shared/utils/fetchDocument"
import LoggingController from "../../shared/utils/loggingClient"

export async function processPaymentUpdate(
  paymentAttemptId: string,
  paymentAttemptStatus: PaymentAttemptStatus,
  orderId: string | null = null
) {
  const logger = new LoggingController("Process payment update")

  logger.log("processing payment update", { paymentAttemptId, paymentAttemptStatus, orderId })

  if (paymentAttemptStatus === PaymentAttemptStatus.PENDING) {
    logger.log("Payment attempt status is pending, returning")
    return [true, null]
  }

  const updatePaymentAttempt = db()
    .collection(Collection.PAYMENT_ATTEMPT)
    .doc(paymentAttemptId)
    .update({
      status: paymentAttemptStatus,
    })

  const promises: Promise<any>[] = [updatePaymentAttempt]

  if (
    [PaymentAttemptStatus.SUCCESSFUL, PaymentAttemptStatus.ACCEPTED].includes(
      paymentAttemptStatus
    )
  ) {
    logger.log("Payment attempt status is successful or accepted")

    if (!orderId) {
      logger.log("No order id, getting from payment attempt")
      const { paymentAttempt, paymentAttemptError } = await fetchDocument(
        Collection.PAYMENT_ATTEMPT,
        paymentAttemptId
      )

      if (paymentAttemptError) {
        return [false, paymentAttemptError]
      }

      orderId = paymentAttempt.orderId
    }

    logger.log("retrieving order", { orderId })

    const { order, orderError } = await fetchDocument(Collection.ORDER, orderId)

    if (orderError) {
      logger.log("Error retrieving order")
      return [false, orderError]
    }

    logger.log("Retrieved order", { order })

    const {
      type,
      orderItems,
      wereTicketsCreated,
      merchantId,
      userId,
      status,
    } = order

    // Only update the order if it's still pending
    if ([OrderStatus.PENDING, OrderStatus.ABANDONED].includes(status)) {
      logger.log("Order status is pending or abandoned, updating order")

      const orderUpdate = {
        status: OrderStatus.PAID,
        paidAt: firestore.FieldValue.serverTimestamp(),
      }

      if (type === OrderType.TICKETS && !wereTicketsCreated) {
        logger.log("Order is of type tickets and tickets not already created", { type, wereTicketsCreated })

        const { productId, eventId, quantity } = orderItems[0]

        const updateProduct = db()
          .collection(Collection.PRODUCT)
          .doc(productId)
          .update({
            reservedCount: firestore.FieldValue.increment(-quantity),
          })

        promises.push(updateProduct)

        orderUpdate["wereTicketsCreated"] = true

        const [
          { merchant, merchantError },
          { event, eventError },
          { product, productError }
        ] = await Promise.all([
          fetchDocument(Collection.MERCHANT, merchantId),
          fetchDocument(Collection.EVENT, eventId),
          fetchDocument(Collection.PRODUCT, productId)
        ])

        for (const error of [merchantError, eventError, productError]) {
          if (error) {
            return [false, error]
          }
        }

        promises.push(
          processSuccessfulTicketsOrder(
            merchant,
            event,
            product,
            orderId,
            userId,
            quantity,
          )
        )
      }

      logger.log("Updating order", { orderId, orderUpdate })

      const updateOrder = db()
        .collection(Collection.ORDER)
        .doc(orderId)
        .update(orderUpdate)

      promises.push(updateOrder)
    } else {
      logger.log("Order status is not pending or abandoned, skipped update")
    }
  }

  await Promise.all(promises)

  logger.log("Promises resolved, returning")

  return [true, null]
}
