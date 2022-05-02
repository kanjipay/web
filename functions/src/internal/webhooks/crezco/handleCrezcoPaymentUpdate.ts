import * as sha256 from "sha256";

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

    const [{eventType, id, metadata, partnerMetadata}] = req.body;
    loggingClient.log("Request received", { req });
    loggingClient.log("Payload received", { eventType, id, metadata });
    if (!eventType || !(eventType in crezcoPaymentStatuses)) {
      loggingClient.log("Non-payment event type received", { eventType });
      return res.sendStatus(400);
    }
    const {paymentIntentId,paymentHash} = partnerMetadata;

    if (sha256(process.env.CREZCO_API_KEY + paymentIntentId) != paymentHash) {
      loggingClient.log("Non-matching paymentIntentId and hash", { paymentIntentId, paymentHash });
      return res.sendStatus(400);
    }
    const paymentAttemptStatus = crezcoPaymentStatuses[eventType];
    const { paymentDemandId } = metadata;
    await updatePaymentAttemptIfNeeded('crezco', id, paymentDemandId, paymentAttemptStatus);
    loggingClient.log("updating payement received", { id, paymentDemandId, paymentAttemptStatus });
    res.sendStatus(200)
  } catch (err) {
    console.log(err)
    res.sendStatus(500)
  }
  
}
