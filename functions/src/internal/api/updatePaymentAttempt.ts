import { firestore } from "firebase-admin";
import Collection from "../../shared/enums/Collection";
import PaymentAttemptStatus from "../../shared/enums/PaymentAttemptStatus";
import { PaymentIntentStatus } from "../../shared/enums/PaymentIntentStatus";
import { WebhookCode } from "../../shared/enums/WebhookCode";
import { db } from "../../shared/utils/admin";
import { HttpError, HttpStatusCode } from "../../shared/utils/errors";
import { fetchDocument } from "../../shared/utils/fetchDocument";
import LoggingController from "../../shared/utils/loggingClient";
import { sendWebhook } from "../webhooks/sendWebhook";

export async function updatePaymentAttemptIfNeededCrezco(paymentAttemptId: string, paymentAttemptStatus: PaymentAttemptStatus) {
  const logger = new LoggingController("Update payment attempt if needed crezco")
  logger.log("Got variables", {}, {
    paymentAttemptId,
    paymentAttemptStatus
  })

  const { paymentAttempt, paymentAttemptError } = await fetchDocument(Collection.PAYMENT_ATTEMPT, paymentAttemptId)

  if (paymentAttemptError) {
    return { error: paymentAttemptError }
  }

  const { paymentIntentId } = paymentAttempt;
  const { paymentIntent, paymentIntentError } = await fetchDocument(Collection.PAYMENT_INTENT, paymentIntentId, { status: PaymentIntentStatus.PENDING })

  if (paymentIntentError) {
    return { error: paymentIntentError }
  }

  const redirectUrl = paymentIntent.successUrl

  if (paymentAttemptStatus === PaymentAttemptStatus.SUCCESSFUL) {
    await db()
      .collection(Collection.PAYMENT_INTENT)
      .doc(paymentIntentId)
      .set({
        status: PaymentIntentStatus.SUCCESSFUL,
        paidAt: firestore.FieldValue.serverTimestamp(),
        paymentAttemptId,
        crezco: {
          
        },
      }, { merge: true })

    const { clientId, payeeId } = paymentIntent
    const { client, clientError } = await fetchDocument(Collection.CLIENT, clientId)

    if (clientError) {
      return { error: clientError }
    }

    const { webhookUrl } = client

    // TODO: implement retries
    await sendWebhook(webhookUrl, {
      webhookCode: WebhookCode.PAYMENT_INTENT_UPDATE,
      paymentAttemptId,
      paymentIntentId,
      payeeId,
      timestamp: new Date(),
      paymentIntentStatus: PaymentIntentStatus.SUCCESSFUL
    })
  }

  await db()
    .collection(Collection.PAYMENT_ATTEMPT)
    .doc(paymentAttemptId)
    .update({
      status: paymentAttemptStatus,
    })

  return { redirectUrl, paymentIntentId }
}

export async function updatePaymentAttemptIfNeededMoneyhub(
  moneyhubPaymentId: string, 
  moneyhubPaymentSubmissionId: string, 
  paymentAttemptStatus: PaymentAttemptStatus
) {
  const loggingClient = new LoggingController("Update payment attempt")

  loggingClient.log("Received Payment Update Subroutine Started", {}, {
    moneyhubPaymentId,
    moneyhubPaymentSubmissionId,
    paymentAttemptStatus
  });

  if (paymentAttemptStatus === PaymentAttemptStatus.PENDING) { return }

  const paymentAttemptSnapshot = await db()
    .collection(Collection.PAYMENT_ATTEMPT)
    .where(`moneyhub.paymentId`, "==", moneyhubPaymentId)
    .limit(1)
    .get();

  loggingClient.log("Loaded payment attempt snapshot");

  if (paymentAttemptSnapshot.docs.length === 0) {
    loggingClient.error("Could not find payment attempt");
    const error = new HttpError(
      HttpStatusCode.NOT_FOUND,
      "Something went wrong",
      `PaymentAttempt with paymentId ${moneyhubPaymentId} with provider moneyhub not found`
    )

    return { error }
  }

  const paymentAttemptDoc = paymentAttemptSnapshot.docs[0];
  const paymentAttemptId = paymentAttemptDoc.id
  const paymentAttempt: any = { id: paymentAttemptId, ...paymentAttemptDoc.data() }

  loggingClient.log("Got payment attempt", { paymentAttempt })

  const { paymentIntentId } = paymentAttempt;
  const { paymentIntent, paymentIntentError } = await fetchDocument(Collection.PAYMENT_INTENT, paymentIntentId, { status: PaymentIntentStatus.PENDING })

  if (paymentIntentError) {
    return { error: paymentIntentError }
  }

  const redirectUrl = paymentIntent.successUrl

  if (paymentAttemptStatus === PaymentAttemptStatus.SUCCESSFUL) {
    // This is only needed for processing refunds
    // const { exists, paymentData } = await fetchMoneyhubPayment(paymentId)

    // if (!exists) {
    //   next(
    //     new HttpError(
    //       HttpStatusCode.NOT_FOUND,
    //       "Something went wrong",
    //       `Moneyhub payment with paymentId ${paymentId} with not found`
    //     )
    //   );
    //   return;
    // }
    // const { isReversible } = paymentData
    

    // I don't think there's a way of updating and retrieving the payment intent at the same time annoyingly
    await db()
      .collection(Collection.PAYMENT_INTENT)
      .doc(paymentIntentId)
      .set({
        status: PaymentIntentStatus.SUCCESSFUL,
        paidAt: firestore.FieldValue.serverTimestamp(),
        paymentAttemptId,
        moneyhub: {
          paymentSubmissionId: moneyhubPaymentSubmissionId
        },
        isReversible: false
      }, { merge: true })

    const { clientId, payee } = paymentIntent
    const { payeeId } = payee
    const { client, clientError } = await fetchDocument(Collection.CLIENT, clientId)

    if (clientError) {
      return { error: clientError }
    }

    const { webhookUrl } = client

    // TODO: implement retries
    await sendWebhook(webhookUrl, {
      webhookCode: WebhookCode.PAYMENT_INTENT_UPDATE,
      paymentAttemptId,
      paymentIntentId,
      payeeId,
      timestamp: new Date(),
      paymentIntentStatus: PaymentIntentStatus.SUCCESSFUL
    })
  }

  await db()
    .collection(Collection.PAYMENT_ATTEMPT)
    .doc(paymentAttemptDoc.id)
    .update({
      status: paymentAttemptStatus,
    })

  return { redirectUrl, paymentIntentId }
}