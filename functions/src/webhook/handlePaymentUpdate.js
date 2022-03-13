import { HttpError, HttpStatusCode } from "../utils/errors";

import PaymentAttemptStatus from "../enums/PaymentAttemptStatus";
import { db } from "../admin";
import Collection from "../enums/Collection";
import OrderStatus from "../enums/OrderStatus";

export const handlePaymentUpdate = async (req, res, next) => {
  const isValid = await verify(req);

  if (!isValid) {
    next(new HttpError(HttpStatusCode.UNAUTHORIZED));
    return;
  }

  const { payment_id, new_payment_status } = req.body;

  const retryableErrors = ["PAYMENT_STATUS_FAILED", "PAYMENT_STATUS_BLOCKED"];

  const nonRetryableErrors = [
    "PAYMENT_STATUS_INSUFFICIENT_FUNDS",
    "PAYMENT_STATUS_REJECTED",
  ];

  const paymentStatusMap = {
    PAYMENT_STATUS_EXECUTED: PaymentAttemptStatus.SUCCESSFUL,
    PAYMENT_STATUS_CANCELLED: PaymentAttemptStatus.CANCELLED,
    PAYMENT_STATUS_FAILED: PaymentAttemptStatus.FAILED,
    PAYMENT_STATUS_BLOCKED: PaymentAttemptStatus.FAILED,
    PAYMENT_STATUS_INSUFFICIENT_FUNDS: PaymentAttemptStatus.FAILED,
    PAYMENT_STATUS_REJECTED: PaymentAttemptStatus.FAILED,
  };

  if (new_payment_status in paymentStatusMap) {
    const paymentAttemptSnapshot = await db
      .collection(Collection.PAYMENT_ATTEMPT.name)
      .where("payment_id", "==", payment_id)
      .limit(1)
      .get()
      .catch(
        new ErrorHandler(HttpStatusCode.INTERNAL_SERVER_ERROR, next).handle
      );

    if (paymentAttemptSnapshot.docs.length === 0) {
      next(new HttpError(HttpStatusCode.NOT_FOUND));
      return;
    }

    const paymentAttemptDoc = paymentAttemptSnapshot.docs[0];
    const paymentAttemptStatus = paymentStatusMap[new_payment_status];

    const update = { status: paymentAttemptStatus };

    if (paymentAttemptStatus === PaymentAttemptStatus.FAILED) {
      update["failure_reason"] = new_payment_status;
    }

    await db
      .doc(paymentAttemptDoc.ref)
      .set(update, { merge: true })
      .catch(
        new ErrorHandler(HttpStatusCode.INTERNAL_SERVER_ERROR, next).handle
      );

    if (paymentAttemptStatus === PaymentAttemptStatus.SUCCESSFUL) {
      const orderId = paymentAttemptDoc.data().order_id;

      await db
        .collection(Collection.ORDER.name)
        .doc(orderId)
        .set({ status: OrderStatus.PAID }, { merge: true })
        .catch(
          new ErrorHandler(HttpStatusCode.INTERNAL_SERVER_ERROR, next).handle
        );
    }
  }

  return res.sendStatus(200);
};
