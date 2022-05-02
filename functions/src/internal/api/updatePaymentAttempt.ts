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

 
function createPaymentIntentData(paymentAttemptId, PaymentSubmissionId, provider){
  return {
    status: PaymentIntentStatus.SUCCESSFUL,
    paidAt: firestore.FieldValue.serverTimestamp(),
    paymentAttemptId,
    PaymentSubmissionId,
    provider,
    isReversible: false
  }
}

export async function updatePaymentAttemptIfNeeded(
  provider: string,
  PaymentId: string, 
  PaymentSubmissionId: string, 
  paymentAttemptStatus: PaymentAttemptStatus
) {
  const loggingClient = new LoggingController("Update payment attempt")

  loggingClient.log("Received Payment Update Subroutine Started", {}, {
    provider,
    PaymentId,
    PaymentSubmissionId,
    paymentAttemptStatus
  });

  if (paymentAttemptStatus === PaymentAttemptStatus.PENDING) { return }

  const paymentAttemptSnapshot = await db()
    .collection(Collection.PAYMENT_ATTEMPT)
    .where(`paymentId`, "==", PaymentId)
    .limit(1)
    .get();

  loggingClient.log("Loaded payment attempt snapshot");

  if (paymentAttemptSnapshot.docs.length === 0) {
    loggingClient.error("Could not find payment attempt");
    const error = new HttpError(
      HttpStatusCode.NOT_FOUND,
      "Something went wrong",
      `PaymentAttempt with paymentId ${PaymentId} with provider ${provider} not found`
    )

    return { error }
  }

  const paymentAttemptDoc = paymentAttemptSnapshot.docs[0];
  const paymentAttemptId = paymentAttemptDoc.id
  const paymentAttempt = { id: paymentAttemptId, ...paymentAttemptDoc.data() }

  loggingClient.log("Got payment attempt", { paymentAttempt })

  const { paymentIntentId } = paymentAttemptDoc.data();
  const { paymentIntent, paymentIntentError } = await fetchDocument(Collection.PAYMENT_INTENT, paymentIntentId)

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
    
    const paymentIntentData = createPaymentIntentData(paymentAttemptId, PaymentSubmissionId, provider);

    // I don't think there's a way of updating and retrieving the payment intent at the same time annoyingly
    await db()
      .collection(Collection.PAYMENT_INTENT)
      .doc(paymentIntentId)
      .set(paymentIntentData, { merge: true })

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