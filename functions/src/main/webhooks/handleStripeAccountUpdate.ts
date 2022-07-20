import { logger } from "firebase-functions/v1"
import { StripeWebhookName, verifyStripe } from "./utils/stripeUtils"

export const handleStripeAccountUpdate = async (req, res, next) => {
  try {
    const { isVerified, event } = verifyStripe(req, StripeWebhookName.ACCOUNT_UPDATE)

    if (!isVerified) {
      return res.sendStatus(400)
    }

    logger.log(event)

    return res.sendStatus(200)
  } catch (err) {
    console.log(err)
    return res.sendStatus(200)
  }
}