import Collection from "../../shared/enums/Collection"
import PaymentAttemptStatus from "../../shared/enums/PaymentAttemptStatus"
import { fetchDocument } from "../../shared/utils/fetchDocument"
import LoggingController from "../../shared/utils/loggingClient"
import { verifyMercadoSignature } from "../../shared/utils/verifyMercadoSignature"
import { processPaymentUpdate } from "./processPaymentUpdate"

const crezcoPaymentStatuses = {
  PaymentCompleted: PaymentAttemptStatus.SUCCESSFUL,
  PaymentPending: PaymentAttemptStatus.PENDING,
  PaymentFailed: PaymentAttemptStatus.FAILED,
  PaymentError: PaymentAttemptStatus.FAILED,
  PaymentAccepted: PaymentAttemptStatus.ACCEPTED,
}

export const handleCrezcoWebhook = async (req, res, next) => {
  try {
    const loggingClient = new LoggingController("Crezco Webhook")
    loggingClient.log("Handing crezco payment update", {
      payload: JSON.stringify(req.body[0]),
    })

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

    const { paymentAttemptId, environment } = payload

    if (environment !== process.env.ENVIRONMENT) {
      loggingClient.log(
        `Webhook is for ${environment} whereas current environment is ${process.env.ENVIRONMENT}`
      )
      return res.sendStatus(200)
    }

    loggingClient.log("Got payment attempt id", {}, { paymentAttemptId })

    if (!eventType || !(eventType in crezcoPaymentStatuses)) {
      loggingClient.log("Crezco eventType undefined or not recognised", {
        eventType,
      })
      return res.sendStatus(200)
    }

    const paymentAttemptStatus = crezcoPaymentStatuses[eventType]

    loggingClient.log("Got payment attempt status", { paymentAttemptStatus: paymentAttemptStatus ?? "undefined" })

    if (paymentAttemptStatus === PaymentAttemptStatus.PENDING) {
      return res.sendStatus(200)
    }

    loggingClient.log("Fetching payment attempt", { paymentAttemptId })

    const { paymentAttempt, paymentAttemptError } = await fetchDocument(
      Collection.PAYMENT_ATTEMPT,
      paymentAttemptId
    )

    if (paymentAttemptError) {
      loggingClient.log("An error occured fetch payment attempt", {
        message: paymentAttemptError.message,
      })
      return res.sendStatus(200)
    }

    loggingClient.log("Got payment attempt", { paymentAttempt })

    const [, error] = await processPaymentUpdate(
      paymentAttempt.id,
      paymentAttemptStatus,
      paymentAttempt.orderId
    )

    if (error) {
      loggingClient.log("An error occured processing payment update", { message: error.message, error })
      return res.sendStatus(200)
    }

    return res.sendStatus(200)
  } catch (err) {
    console.log(err)
    return res.sendStatus(200)
  }
}
