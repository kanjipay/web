import PaymentAttemptStatus from "../../../shared/enums/PaymentAttemptStatus";
import LoggingController from "../../../shared/utils/loggingClient";
import { updatePaymentAttemptIfNeededMoneyhub } from "../../api/updatePaymentAttempt";

const moneyhubPaymentStatuses = {
  "urn:com:moneyhub:events:payment-completed": PaymentAttemptStatus.SUCCESSFUL,
  "urn:com:moneyhub:events:payment-rejected": PaymentAttemptStatus.FAILED
}

export const handleMoneyhubPaymentUpdate = async (req, res, next) => {
  try {
    const loggingClient = new LoggingController("Moneyhub Webhook");

    const { payload } = req // Attached to request by verifyMoneyhub middleware

    loggingClient.log("Payload received", { payload })

    const eventUrn = Object.keys(payload.events).find(e => true)

    if (!eventUrn || !(eventUrn in moneyhubPaymentStatuses)) {
      loggingClient.log("Non-payment event urn received", { eventUrn })
      return res.sendStatus(200)
    }

    const paymentAttemptStatus = moneyhubPaymentStatuses[eventUrn]
    const { paymentId, paymentSubmissionId } = payload.events[eventUrn]

    await updatePaymentAttemptIfNeededMoneyhub(paymentId, paymentSubmissionId, paymentAttemptStatus)

    return res.sendStatus(200)
  } catch (err) {
    console.log(err)
    res.sendStatus(500)
  }
}

