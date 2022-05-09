import { logger } from "firebase-functions/v1";
import PaymentAttemptStatus from "../../../shared/enums/PaymentAttemptStatus"
import LoggingController from "../../../shared/utils/loggingClient";
import { updatePaymentAttemptIfNeededCrezco } from "../../api/updatePaymentAttempt";

const crezcoPaymentStatuses = {
  PaymentCompleted: PaymentAttemptStatus.SUCCESSFUL,
  PaymentPending: PaymentAttemptStatus.PENDING,
  PaymentFailed: PaymentAttemptStatus.FAILED
}

export const handleCrezcoPaymentUpdate = async (req, res, next) => {
  try {
    const loggingClient = new LoggingController("Crezco Webhook");

    loggingClient.log("Handing crezco payment update")
    const { eventType, metadata } = req.body[0]
    const { payDemandId } = metadata

    loggingClient.log("Got Crezco data", {}, { eventType, payDemandId })

    const { paymentAttemptId } = req.payload

    loggingClient.log("Got payment attempt id", {}, { paymentAttemptId })

    if (!eventType || !(eventType in crezcoPaymentStatuses)) {
      loggingClient.log("Crezco eventType undefined or not recognised", { eventType })
      return res.sendStatus(200)
    }

    const paymentAttemptStatus = crezcoPaymentStatuses[eventType]

    await updatePaymentAttemptIfNeededCrezco(paymentAttemptId, paymentAttemptStatus)

    return res.sendStatus(200)
  } catch (err) {
    logger.error(err)
    return res.sendStatus(200)
  }
}