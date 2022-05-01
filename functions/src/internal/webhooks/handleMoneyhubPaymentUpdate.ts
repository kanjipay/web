import axios from "axios";
import { firestore } from "firebase-admin";
import * as sha256 from "sha256";
import Collection from "../../shared/enums/Collection";
import PaymentAttemptStatus from "../../shared/enums/PaymentAttemptStatus";
import { PaymentIntentStatus } from "../../shared/enums/PaymentIntentStatus";
import { db } from "../../shared/utils/admin";
import { ErrorHandler, HttpError, HttpStatusCode } from "../../shared/utils/errors";
import { fetchDocument } from "../../shared/utils/fetchDocument";
import LoggingController from "../../shared/utils/loggingClient";
// import { fetchMoneyhubPayment } from "../../shared/utils/moneyhubClient";
import * as jwt from "jsonwebtoken"
import * as jwkToPem from "jwk-to-pem"
import { v4 as uuid } from "uuid"
import { WebhookCode } from "../../shared/enums/WebhookCode";

export const handleMoneyhubPaymentUpdate = async (req, res, next) => {
  try {
    const loggingClient = new LoggingController("Moneyhub Webhook");

    const { payload } = req // Attached to request by verifyMoneyhub middleware

    loggingClient.log("Payload received", {}, payload)

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

    loggingClient.log("Received Payment Update Subroutine Started", {}, {
      paymentId,
      paymentSubmissionId,
      paymentAttemptStatus
    });

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

      const { paymentIntentId } = paymentAttemptDoc.data();
      
      const { paymentIntent, paymentIntentError } = await fetchDocument(Collection.PAYMENT_INTENT, paymentIntentId)

      if (paymentIntentError) {
        next(paymentIntentError)
        return
      }

      // I don't think there's a way of updating and retrieving the payment intent at the same time annoyingly
      await db()
        .collection(Collection.PAYMENT_INTENT)
        .doc(paymentIntentId)
        .update({ 
          status: PaymentIntentStatus.SUCCESSFUL, 
          paidAt: firestore.FieldValue.serverTimestamp(),
          paymentAttemptId,
          moneyhub: {
            paymentSubmissionId
          },
          isReversible: false
        })
        .catch(
          new ErrorHandler(HttpStatusCode.INTERNAL_SERVER_ERROR, next).handle
        );

      const { clientId, payee } = paymentIntent
      const { payeeId } = payee
      const { client, clientError } = await fetchDocument(Collection.CLIENT, clientId)

      if (clientError) {
        next(clientError)
        return
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
      .catch(new ErrorHandler(HttpStatusCode.INTERNAL_SERVER_ERROR, next).handle);

    res.sendStatus(200)

  } catch (err) {
    console.log(err)
    res.sendStatus(500)
  }
}

export async function sendWebhook(webhookUrl: string, body: Object) {
  const bodyString = JSON.stringify(body)
  const bodyHash = sha256(bodyString)

  // iat is generated automatically by jwt.sign so no need to include it here
  const payload = {
    jti: uuid(),
    exp: Math.round(Date.now() / 1000) + 3600,
    sub: `${process.env.BASE_SERVER_URL}/clientApi`,
    iss: `${process.env.BASE_SERVER_URL}/internal`,
    aud: webhookUrl,
    body_sha_256: bodyHash
  }

  const jwks = JSON.parse(process.env.JWKS_PRIVATE_KEY)
  const [key] = jwks.keys
  const pem = jwkToPem(key)

  let signature: string

  try {
    signature = jwt.sign(payload, pem)
  } catch (err) {
    return false
  }
  
  await axios.post(webhookUrl, body, {
    headers: {
      "mcp-signature": signature
    }
  }).catch(error => {
    return false
  })

  return true
}