import Collection from "../../../shared/enums/Collection";
import OrderStatus from "../../../shared/enums/OrderStatus";
import PaymentAttemptStatus from "../../../shared/enums/PaymentAttemptStatus";
import { db } from "../../../shared/utils/admin";
import { ErrorHandler, HttpError, HttpStatusCode } from "../../../shared/utils/errors";

export const receivePaymentUpdate = async (
  paymentId: string,
  paymentAttemptStatus: PaymentAttemptStatus,
  failureReason: string | null,
  loggingClient,
  next
) => {
  loggingClient.log("Received Payment Update Subroutine Started");
  const paymentAttemptSnapshot = await db()
    .collection(Collection.PAYMENT_ATTEMPT)
    .where(`moneyhub.paymentId`, "==", paymentId)
    .limit(1)
    .get();

  loggingClient.log("Loaded payment attempt snapshot");

  if (paymentAttemptSnapshot.docs.length === 0) {
    loggingClient.error("Could not find payment attempt");
    next(
      new HttpError(
        HttpStatusCode.NOT_FOUND,
        "Something went wrong",
        `PaymentAttempt with paymentId ${paymentId} with provider moneyhub not found`
      )
    );
    return;
  }

  const paymentAttemptDoc = paymentAttemptSnapshot.docs[0];
  const update = { status: paymentAttemptStatus };

  if (failureReason) {
    update["failureReason"] = failureReason;
  }

  if (paymentAttemptStatus === PaymentAttemptStatus.SUCCESSFUL) {
    const orderId = paymentAttemptDoc.data().orderId;

    await db()
      .collection(Collection.ORDER)
      .doc(orderId)
      .set({ status: OrderStatus.PAID, paidAt: new Date() }, { merge: true })
      .catch(
        new ErrorHandler(HttpStatusCode.INTERNAL_SERVER_ERROR, next).handle
      );
  }

  await db()
    .collection(Collection.PAYMENT_ATTEMPT)
    .doc(paymentAttemptDoc.id)
    .set(update, { merge: true })
    .catch(new ErrorHandler(HttpStatusCode.INTERNAL_SERVER_ERROR, next).handle);

  return;
};
