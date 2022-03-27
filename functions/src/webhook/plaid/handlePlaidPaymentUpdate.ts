import { ErrorHandler, HttpError, HttpStatusCode } from "../../utils/errors";
import PaymentAttemptStatus from "../../enums/PaymentAttemptStatus";
import { verify } from "./verify";
import { receivePaymentUpdate } from "../shared/receivePaymentUpdate";
import { OpenBankingProvider } from "../../enums/OpenBankingProvider";

export const handlePlaidPaymentUpdate = async (req, res, next) => {
  const isValid = await verify(req).catch(
    new ErrorHandler(HttpStatusCode.INTERNAL_SERVER_ERROR, next).handle
  );

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

  return res.sendStatus(200);
};
