import Collection from "../../../shared/enums/Collection";
import BaseController from "../../../shared/BaseController";
import { db } from "../../../shared/utils/admin";
import { PaymentIntentStatus } from "../../../shared/enums/PaymentIntentStatus";
import { fetchDocument } from "../../../shared/utils/fetchDocument";
import { sendWebhook } from "../../webhooks/sendWebhook";
import { WebhookCode } from "../../../shared/enums/WebhookCode";
import LoggingController from "../../../shared/utils/loggingClient";
import { PaymentIntentCancelReason } from "../../../shared/enums/PaymentIntentCancelReason";

export default class PaymentIntentsController extends BaseController {
  cancel = async (req, res, next) => {
    try {
      const logger = new LoggingController("Cancel Payment Intent")

      const { paymentIntentId } = req.params
      const { cancelReason } = req.body

      logger.log("Cancelling payment intent", { paymentIntentId })
      const { paymentIntent, paymentIntentError } = await fetchDocument(Collection.PAYMENT_INTENT, paymentIntentId)

      if (paymentIntentError) {
        logger.log("Payment intent error", { paymentIntentError })
        next(paymentIntentError)
        return
      }

      logger.log("Fetched payment intent", { paymentIntent })

      await db()
        .collection(Collection.PAYMENT_INTENT)
        .doc(paymentIntentId)
        .update({
          status: PaymentIntentStatus.CANCELLED,
          cancelReason
        })

      const { client, clientError } = await fetchDocument(Collection.CLIENT, paymentIntent.clientId)

      if (clientError) {
        logger.log("Error fetching client", { clientError })
        next(clientError)
        return
      }

      logger.log("Fetched Client for payment intent", { client })

      const didSendWebhook = await sendWebhook(client.webhookUrl, {
        webhookCode: WebhookCode.PAYMENT_INTENT_UPDATE,
        paymentIntentId,
        timestamp: new Date(),
        paymentIntentStatus: PaymentIntentStatus.CANCELLED,
        cancelReason: PaymentIntentCancelReason.USER
      })

      logger.log("Did send webhook", { didSendWebhook })

      return res.sendStatus(200)
    } catch (err) {
      console.log(err)
      return res.sendStatus(500)
    }
  }
}