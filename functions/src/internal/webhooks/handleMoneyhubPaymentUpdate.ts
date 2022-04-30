import PaymentAttemptStatus from "../../shared/enums/PaymentAttemptStatus";
import LoggingController from "../../shared/utils/loggingClient";
import { updatePaymentAttemptIfNeeded } from "../api/updatePaymentAttempt";

export const handleMoneyhubPaymentUpdate = async (req, res, next) => {
  try {
    const loggingClient = new LoggingController("Moneyhub Webhook");

    const { payload } = req // Attached to request by verifyMoneyhub middleware

    loggingClient.log("Payload received", { payload })

    const moneyhubPaymentStatuses = {
      "urn:com:moneyhub:events:payment-completed": PaymentAttemptStatus.SUCCESSFUL,
      "urn:com:moneyhub:events:payment-rejected": PaymentAttemptStatus.FAILED
    }

    const eventUrn = Object.keys(payload.events).find(e => true)

    console.log(Object.keys(moneyhubPaymentStatuses))
    console.log(eventUrn in moneyhubPaymentStatuses)

    if (!eventUrn || !(eventUrn in moneyhubPaymentStatuses)) {
      loggingClient.log("Non-payment event urn received", { eventUrn })
      return res.sendStatus(200)
    }

    const paymentAttemptStatus = moneyhubPaymentStatuses[eventUrn]
    const { paymentId, paymentSubmissionId } = payload.events[eventUrn]

    await updatePaymentAttemptIfNeeded(paymentId, paymentSubmissionId, paymentAttemptStatus)

    res.sendStatus(200)
  } catch (err) {
    console.log(err)
    res.sendStatus(500)
  }
}

