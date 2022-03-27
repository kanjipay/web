import { OpenBankingProvider } from "../../enums/OpenBankingProvider";
import PaymentAttemptStatus from "../../enums/PaymentAttemptStatus";
import { ErrorHandler, HttpError, HttpStatusCode } from "../../utils/errors";
import { receivePaymentUpdate } from "../shared/receivePaymentUpdate";
import { verify } from "./verify";
import * as functions from "firebase-functions";
import { v4 as uuid } from "uuid";

export const handleTruelayerPaymentUpdate = async (req, res, next) => {
  const correlationId = uuid();

  functions.logger.log("Truelayer Webhook Called", {
    correlationId: correlationId,
    body: req.body,
    rawHeaders: req.rawHeaders,
  });

  const isVerified = await verify(req, correlationId).catch(
    new ErrorHandler(HttpStatusCode.INTERNAL_SERVER_ERROR, next).handle
  );

  if (!isVerified) {
    functions.logger.warn(
      "Truelayer verification failed, returning unauthorized",
      {
        correlationId: correlationId,
      }
    );
    next(new HttpError(HttpStatusCode.UNAUTHORIZED, "Unauthorized"));
    return;
  }

  const { payment_id, type, failure_reason } = req.body;

  const paymentStatusMap = {
    payment_executed: PaymentAttemptStatus.SUCCESSFUL,
    payment_failed: PaymentAttemptStatus.FAILED,
  };

  const paymentAttemptStatus = paymentStatusMap[type];

  if (paymentAttemptStatus) {
    functions.logger.log("Attempting to update status of a payment attempt", {
      correlationId: correlationId,
      paymentId: payment_id,
      type: type,
      failureReason: failure_reason,
      paymentAttemptStatus: paymentAttemptStatus,
    });
    await receivePaymentUpdate(
      OpenBankingProvider.TRUELAYER,
      payment_id,
      paymentAttemptStatus,
      failure_reason,
      next
    );
    functions.logger.log("Completed update of status of payment attempt", {
      correlationId: correlationId,
      paymentId: payment_id,
      type: type,
      failureReason: failure_reason,
      paymentAttemptStatus: paymentAttemptStatus,
    });
  }

  return res.sendStatus(200);
};
