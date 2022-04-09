import { OpenBankingProvider } from "../../enums/OpenBankingProvider";
import PaymentAttemptStatus from "../../enums/PaymentAttemptStatus";
import { ErrorHandler, HttpError, HttpStatusCode } from "../../utils/errors";
import { receivePaymentUpdate } from "../shared/receivePaymentUpdate";
import { verify } from "./verify";
import LoggingController from "../../utils/loggingClient";

export const handleTruelayerPaymentUpdate = async (req, res, next) => {
  const loggingClient = new LoggingController("Truelayer Webhook");
  loggingClient.log("Truelayer Payment Webhook Initiated", {}, {provider:'TRUELAYER'});

  loggingClient.log('TL raw data read', {body: req.body,
    rawHeaders: req.rawHeaders});

  const isVerified = await verify(req, loggingClient).catch(
    new ErrorHandler(HttpStatusCode.INTERNAL_SERVER_ERROR, next).handle
  );

  if (!isVerified) {
    loggingClient.warn("Truelayer verification failed, returning unauthorized")

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
    loggingClient.log("Attempting to update status of a payment attempt", {}, 
    {      paymentId: payment_id,
      type: type,
      failureReason: failure_reason,
      paymentAttemptStatus: paymentAttemptStatus,
    });

    await receivePaymentUpdate(
      OpenBankingProvider.TRUELAYER,
      payment_id,
      paymentAttemptStatus,
      failure_reason,
      loggingClient,
      next
    );
    loggingClient.log("Completed update of status of payment attempt");

  }

  return res.sendStatus(200);
};
