import { ErrorHandler, HttpError, HttpStatusCode } from "../../utils/errors";
import PaymentAttemptStatus from "../../enums/PaymentAttemptStatus";
import { verify } from "./verify";
import { receivePaymentUpdate } from "../shared/receivePaymentUpdate";
import { OpenBankingProvider } from "../../enums/PaymentProvider";
import * as functions from "firebase-functions";
import { v4 as uuid } from "uuid";

export const handlePlaidPaymentUpdate = async (req, res, next) => {
  const correlationId = uuid();

  functions.logger.log("Handle Plaid Payment Update Invoked", {
    correlationId: correlationId,
  });

  const isValid = await verify(req).catch(
    new ErrorHandler(HttpStatusCode.INTERNAL_SERVER_ERROR, next).handle
  );

  functions.logger.log("Handle Plaid Payment Verification Complete", {
    correlationId: correlationId,
    verified: isValid,
  });

  if (!isValid) {
    next(new HttpError(HttpStatusCode.UNAUTHORIZED, "Unauthorized"));
    return;
  }

  const { payment_id, new_payment_status } = req.body;

  const paymentStatusMap = {
    PAYMENT_STATUS_EXECUTED: PaymentAttemptStatus.SUCCESSFUL,
    PAYMENT_STATUS_CANCELLED: PaymentAttemptStatus.CANCELLED,
    PAYMENT_STATUS_FAILED: PaymentAttemptStatus.FAILED,
    PAYMENT_STATUS_BLOCKED: PaymentAttemptStatus.FAILED,
    PAYMENT_STATUS_INSUFFICIENT_FUNDS: PaymentAttemptStatus.FAILED,
    PAYMENT_STATUS_REJECTED: PaymentAttemptStatus.FAILED,
  };

  const paymentAttemptStatus = paymentStatusMap[new_payment_status];

  functions.logger.log("Handle Plaid Payment Request mapped", {
    correlationId: correlationId,
    verified: isValid,
    payment_id: payment_id,
    new_payment_status: new_payment_status,
    paymentAttemptStatus: paymentAttemptStatus,
    rawBody: req.body,
    rawRequest: req,
  });

  if (paymentAttemptStatus) {
    const failureReason =
      paymentAttemptStatus === PaymentAttemptStatus.FAILED
        ? new_payment_status
        : null;
    await receivePaymentUpdate(
      OpenBankingProvider.PLAID,
      payment_id,
      paymentAttemptStatus,
      failureReason,
      next
    );
  }
  functions.logger.log("Handle Plaid Payment Request Complete, Returning 200", {
    correlationId: correlationId,
    verified: isValid,
    payment_id: payment_id,
    new_payment_status: new_payment_status,
    paymentAttemptStatus: paymentAttemptStatus,
  });
  return res.sendStatus(200);
};
