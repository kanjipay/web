
import Collection from "../../../shared/enums/Collection";
import OrderStatus from "../../../shared/enums/OrderStatus";
import PaymentAttemptStatus from "../../../shared/enums/PaymentAttemptStatus";
import { db } from "../../../shared/utils/admin";
import { ErrorHandler, HttpError, HttpStatusCode } from "../../../shared/utils/errors";
import LoggingController from "../../../shared/utils/loggingClient";
import { fetchMoneyhubPayment } from "../../../shared/utils/moneyhubClient";

export const handleMoneyhubPaymentUpdate = async (req, res, next) => {
  try {
    const loggingClient = new LoggingController("Moneyhub Webhook");

    const { payload } = req

    const moneyhubPaymentStatuses = {
      "urn:com:moneyhub:events:payment-completed": PaymentAttemptStatus.SUCCESSFUL,
      "urn:com:moneyhub:events:payment-rejected": PaymentAttemptStatus.FAILED
    }

    const eventUrn = Object.keys(payload.events).find(e => true)

    if (eventUrn || !(eventUrn in moneyhubPaymentStatuses)) {
      loggingClient.log("Non-payment event urn received")
      return res.sendStatus(200)
    }

    const paymentAttemptStatus = moneyhubPaymentStatuses[eventUrn]
    const { paymentId, paymentSubmissionId } = payload.events[eventUrn]

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
    const paymentAttemptId = paymentAttemptDoc.id

    const { exists, paymentData } = await fetchMoneyhubPayment(paymentId)

    if (!exists) {
      next(
        new HttpError(
          HttpStatusCode.NOT_FOUND,
          "Something went wrong",
          `Moneyhub payment with paymentId ${paymentId} with not found`
        )
      );
      return;
    }

    if (paymentAttemptStatus === PaymentAttemptStatus.SUCCESSFUL) {
      const orderId = paymentAttemptDoc.data().orderId;
      const { isReversible } = paymentData

      // This needs to be changed into creating a new order
      await db()
        .collection(Collection.ORDER)
        .doc(orderId)
        .set({ 
          status: OrderStatus.PAID, 
          paidAt: new Date(),
          paymentAttemptId,
          moneyhub: {
            paymentSubmissionId
          },
          isReversible
        }, { merge: true })
        .catch(
          new ErrorHandler(HttpStatusCode.INTERNAL_SERVER_ERROR, next).handle
        );
    }

    await db()
      .collection(Collection.PAYMENT_ATTEMPT)
      .doc(paymentAttemptDoc.id)
      .set({ 
        status: paymentAttemptStatus,
      }, { merge: true })
      .catch(new ErrorHandler(HttpStatusCode.INTERNAL_SERVER_ERROR, next).handle);

    res.sendStatus(200)

  } catch (err) {
    console.log(err)
    res.sendStatus(500)
  }
}