import { OpenBankingProvider } from "../../enums/OpenBankingProvider";
import PaymentAttemptStatus from "../../enums/PaymentAttemptStatus";
import { ErrorHandler, HttpError, HttpStatusCode } from "../../utils/errors";
import { receivePaymentUpdate } from "../shared/receivePaymentUpdate";
import { verify } from "./verify"

export const handleTruelayerPaymentUpdate = async (req, res, next) => {
  console.log("handleTruelayerPaymentUpdate")
  const isVerified = await verify(req).catch(
    new ErrorHandler(HttpStatusCode.INTERNAL_SERVER_ERROR, next).handle
  );

  console.log("isVerified: ", isVerified)

  if (!isVerified) {
    next(new HttpError(HttpStatusCode.UNAUTHORIZED, "Unauthorized"));
    return
  }

  const { payment_id, type, failure_reason } = req.body

  console.log(req.body)

  const paymentStatusMap = {
    payment_executed: PaymentAttemptStatus.SUCCESSFUL,
    payment_failed: PaymentAttemptStatus.FAILED
  }

  const paymentAttemptStatus = paymentStatusMap[type]

  if (paymentAttemptStatus) {
      await receivePaymentUpdate(OpenBankingProvider.TRUELAYER, payment_id, paymentAttemptStatus, failure_reason, next)
  }
  
  return res.sendStatus(200);
}