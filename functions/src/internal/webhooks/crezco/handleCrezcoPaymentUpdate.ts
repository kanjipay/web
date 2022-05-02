

import LoggingController from "../../../shared/utils/loggingClient";
import PaymentAttemptStatus from "../../../shared/enums/PaymentAttemptStatus";


import { updatePaymentAttemptIfNeeded } from "../../api/updatePaymentAttempt";
const crezcoPaymentStatuses = {
    "PaymentCompleted": PaymentAttemptStatus.SUCCESSFUL,
    "PaymentPending": PaymentAttemptStatus.PENDING,
    "PaymentFailed": PaymentAttemptStatus.FAILED
  }


export const handleCrezcoPaymentUpdate = async (req, res, next) => {
  try {
    const loggingClient = new LoggingController("Crezco Webhook");

    const [{eventType, id, metadata}] = req.body // Todo create some verification middleware
    loggingClient.log("Request received", { req })
    loggingClient.log("Payload received", { eventType, id, metadata })
    if (!eventType || !(eventType in crezcoPaymentStatuses)) {
      loggingClient.log("Non-payment event type received", { eventType })
      return res.sendStatus(200)
    }
    const paymentAttemptStatus = crezcoPaymentStatuses[eventType]
    const { paymentDemandId } = metadata
    await updatePaymentAttemptIfNeeded(id, paymentDemandId, paymentAttemptStatus)
    loggingClient.log("updating payement received", { id, paymentDemandId, paymentAttemptStatus })
    res.sendStatus(200)
  } catch (err) {
    console.log(err)
    res.sendStatus(500)
  }
  
}
