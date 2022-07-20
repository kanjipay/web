import { logger } from "firebase-functions/v1"
import stripe from "../../../shared/utils/stripeClient"

export enum StripeWebhookName {
  PAYMENT_INTENT_UPDATE = "PaymentIntentUpdate",
  ACCOUNT_UPDATE = "AccountUpdate"
}

export function verifyStripe(req, name: StripeWebhookName) {
  const signature = req.headers["stripe-signature"]
  const endpointSecret = JSON.parse(process.env.STRIPE_WEBHOOK_SECRETS)[name]

  let event

  try {
    event = stripe.webhooks.constructEvent(
      req.rawBody,
      signature,
      endpointSecret
    )
  } catch (err) {
    logger.log("Stripe webhook verification failed", err)

    return { isVerified: false }
  }

  logger.log("Stripe webhook verification succeeded", { event })
  
  return { event, isVerified: false }
}