import Collection from "../../shared/enums/Collection";
import PaymentAttemptStatus from "../../shared/enums/PaymentAttemptStatus";
import { db } from "../../shared/utils/admin";
import LoggingController from "../../shared/utils/loggingClient";
import stripe from "../../shared/utils/stripeClient";
import { processPaymentUpdate } from "./processPaymentUpdate";

const stripePaymentStatuses = {
  "payment_intent.succeeded": PaymentAttemptStatus.SUCCESSFUL,
  "payment_intent.failed": PaymentAttemptStatus.FAILED,
  "payment_intent.cancelled": PaymentAttemptStatus.CANCELLED,
};

export const handleStripeWebhook = async (req, res, next) => {
  try {
    const logger = new LoggingController("Handle Stripe webhook");
    const signature = req.headers["stripe-signature"];

    let event;

    const endpointSecret = process.env.STRIPE_PAYMENT_WEBHOOK_SECRET;

    logger.log("Stripe webhook received", {
      signature,
      body: req.body,
      endpointSecret,
    });

    try {
      event = stripe.webhooks.constructEvent(
        req.rawBody,
        signature,
        endpointSecret
      );
    } catch (err) {
      logger.log("Stripe webhook verification failed: ", err.message);
      return res.sendStatus(400);
    }

    logger.log("Stripe webhook verification succeeded", { event });

    const paymentAttemptStatus = stripePaymentStatuses[event.type];

    if (!paymentAttemptStatus) {
      logger.log("Unrecognised Stripe event type", { eventType: event.type });
    }

    const stripePaymentIntentId = event.data.object.id;

    const paymentAttemptSnapshot = await db()
      .collection(Collection.PAYMENT_ATTEMPT)
      .where("stripe.paymentIntentId", "==", stripePaymentIntentId)
      .get();

    const paymentAttempts: any[] = paymentAttemptSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    if (paymentAttempts.length === 0) {
      logger.log("No payment attempt found", { stripePaymentIntentId });
      return res.sendStatus(200);
    }

    const paymentAttempt = paymentAttempts[0];

    const [, error] = await processPaymentUpdate(
      paymentAttempt.id,
      paymentAttemptStatus,
      paymentAttempt.orderId
    );

    if (error) {
      logger.log("An error occured", { message: error.message });
      return res.sendStatus(200);
    }

    return res.sendStatus(200);
  } catch (err) {
    console.log(err);
    return res.sendStatus(200);
  }
};
