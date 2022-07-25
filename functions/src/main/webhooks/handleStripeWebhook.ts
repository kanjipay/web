import Collection from "../../shared/enums/Collection"
import PaymentAttemptStatus from "../../shared/enums/PaymentAttemptStatus"
import { db } from "../../shared/utils/admin"
import LoggingController from "../../shared/utils/loggingClient"
import { processPaymentUpdate } from "./processPaymentUpdate"
import { StripeWebhookName, verifyStripe } from "./utils/stripeUtils"

const stripePaymentStatuses = {
  "payment_intent.succeeded": PaymentAttemptStatus.SUCCESSFUL,
  "payment_intent.failed": PaymentAttemptStatus.FAILED,
  "payment_intent.cancelled": PaymentAttemptStatus.CANCELLED,
}

export const handleStripeWebhook = async (req, res, next) => {
  try {
    const logger = new LoggingController("Handle Stripe webhook")
    logger.log("Handling stripe payment webhook")

    const { isVerified, event } = verifyStripe(
      req,
      StripeWebhookName.PAYMENT_INTENT_UPDATE
    )

    if (!isVerified) {
      return res.sendStatus(400)
    }

    const paymentAttemptStatus = stripePaymentStatuses[event.type]

    if (!paymentAttemptStatus) {
      logger.log("Unrecognised Stripe event type", { eventType: event.type })
      return res.sendStatus(200)
    }

    const stripePaymentIntentId = event.data.object.id

    const paymentAttemptSnapshot = await db()
      .collection(Collection.PAYMENT_ATTEMPT)
      .where("stripe.paymentIntentId", "==", stripePaymentIntentId)
      .get()

    const paymentAttempts: any[] = paymentAttemptSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    if (paymentAttempts.length === 0) {
      logger.log("No payment attempt found", { stripePaymentIntentId })
      return res.sendStatus(200)
    }

    const paymentAttempt = paymentAttempts[0]

    const [, error] = await processPaymentUpdate(
      paymentAttempt.id,
      paymentAttemptStatus,
      paymentAttempt.orderId
    )

    if (error) {
      logger.log("An error occured", { message: error.message })
      return res.sendStatus(200)
    }

    return res.sendStatus(200)
  } catch (err) {
    console.log(err)
    return res.sendStatus(200)
  }
}
