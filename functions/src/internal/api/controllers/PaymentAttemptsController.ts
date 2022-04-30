import Collection from "../../../shared/enums/Collection";
import BaseController from "../../../shared/BaseController";
import PaymentAttemptStatus from "../../../shared/enums/PaymentAttemptStatus";
import { db } from "../../../shared/utils/admin";
import { ErrorHandler, HttpError, HttpStatusCode } from "../../../shared/utils/errors";
import LoggingController from "../../../shared/utils/loggingClient";
import { generateMoneyhubPaymentAuthUrl, getMoneyhubPayment, processAuthSuccess } from "../../../shared/utils/moneyhubClient";
import { v4 as uuid } from "uuid";
import * as jwt from "jsonwebtoken";
import { fetchDocument } from "../../../shared/utils/fetchDocument";
import { firestore } from "firebase-admin";
import { PaymentIntentStatus } from "../../../shared/enums/PaymentIntentStatus";
import { updatePaymentAttemptIfNeeded } from "../updatePaymentAttempt";

export default class PaymentAttemptsController extends BaseController {
  create = async (req, res, next) => {
    try {
      const { paymentIntentId, moneyhubBankId, deviceId, stateId, clientState } = req.body;

      const { paymentIntent, paymentIntentError } = await fetchDocument(Collection.PAYMENT_INTENT, paymentIntentId, { 
        status: PaymentIntentStatus.PENDING
      })

      if (paymentIntentError) {
        next(paymentIntentError)
        return
      }

      const { amount, payee } = paymentIntent
      const { moneyhubPayeeId, companyName, payeeId } = payee

      const loggingClient = new LoggingController("Payment Attempts Controller");
      loggingClient.log(
        "Payment Attempt Initiated",
        {
          environment: process.env.ENVIRONMENT,
          envClientURL: process.env.CLIENT_URL,
        },
        {
          paymentIntentId,
          deviceId,
          amount,
        }
      );

      const paymentAttemptId = uuid()
      const bankId = process.env.ENVIRONMENT !== "PROD" ? "1ffe704d39629a929c8e293880fb449a" : moneyhubBankId
      
      const authUrl = await generateMoneyhubPaymentAuthUrl(
        moneyhubPayeeId,
        companyName,
        bankId,
        stateId,
        clientState,
        amount,
        paymentAttemptId
      );

      loggingClient.log("Make payment function complete");

      const paymentAttemptData = {
        paymentIntentId,
        moneyhub: {
          payeeId: moneyhubPayeeId,
          bankId,
        },
        payeeId,
        status: PaymentAttemptStatus.PENDING,
        createdAt: firestore.FieldValue.serverTimestamp(),
        deviceId,
        amount,
      };

      await db()
        .collection(Collection.PAYMENT_ATTEMPT)
        .doc(paymentAttemptId)
        .set(paymentAttemptData)
        .catch(new ErrorHandler(HttpStatusCode.INTERNAL_SERVER_ERROR, next).handle)

      loggingClient.log("Payment attempt doc added", { paymentAttemptData });

      loggingClient.log("Payment Attempt Controller Finished returning 200", {
        paymentAttemptId,
      });

      return res.status(200).json({
        authUrl,
      });
    } catch (err) {
      console.log(err)
      return res.sendStatus(500)
    }
  };

  confirm = async (req, res, next) => {
    try {
      const { code, state, idToken } = req.body
      const stateVars = state.split(".")

      if (stateVars.length !== 3) {
        next(new HttpError(HttpStatusCode.BAD_REQUEST, "An error occured", `Malformed state ${state}`))
        return
      }

      const [paymentAttemptId, stateId] = stateVars
      console.log("stateId: ", stateId)

      const stateResult = await fetchDocument(Collection.STATE, stateId)
      const stateObject = stateResult.state
      const { stateError } = stateResult

      console.log("stateObject: ", JSON.stringify(stateObject))

      if (stateError) {
        next(stateError)
        return
      }

      const { clientState } = stateObject.additionalData
      const { id_token } = await processAuthSuccess(code, state, idToken, paymentAttemptId, stateId, clientState)

      console.log("get id token back: ", id_token)

      const decoded = jwt.decode(id_token, { complete: true })

      console.log("decoded id token: ", JSON.stringify(decoded))
      const paymentId = decoded.payload["mh:payment"]

      await db()
        .collection(Collection.PAYMENT_ATTEMPT)
        .doc(paymentAttemptId)
        .update({
          "moneyhub.paymentId": paymentId
        })

      return res.status(200).send({ paymentAttemptId, stateId })
    } catch (err) {
      console.log(err)
      return res.sendStatus(500)
    }
  }

  checkPayment = async (req, res, next) => {
    try {
      const logger = new LoggingController("Check payment")
      const { paymentAttemptId } = req.params

      const { paymentAttempt, paymentAttemptError } = await fetchDocument(Collection.PAYMENT_ATTEMPT, paymentAttemptId)
      
      if (paymentAttemptError) {
        next(paymentAttemptError)
        return
      }

      // If status has already been updated, return early
      if (paymentAttempt.status !== PaymentAttemptStatus.PENDING) {
        res.status(200).json({ paymentAttemptStatus: paymentAttempt.status })
      }

      const moneyhubPaymentId = paymentAttempt.moneyhub.paymentId

      logger.log("Got moneyhub payment id", {}, { moneyhubPaymentId })
      const { paymentSubmissionId, status } = await getMoneyhubPayment(moneyhubPaymentId)

      logger.log("Got moneyhub data", {}, { paymentSubmissionId, status })

      const moneyhubStatusMap = {
        "completed": PaymentAttemptStatus.SUCCESSFUL,
        "rejected": PaymentAttemptStatus.FAILED,
        "pending": PaymentAttemptStatus.PENDING
      }

      const paymentAttemptStatus = moneyhubStatusMap[status]

      if (!paymentAttemptStatus) {
        next(new HttpError(HttpStatusCode.INTERNAL_SERVER_ERROR, "Something went wrong", "Invalid moneyhub status " + status))
        return
      }

      const { error, redirectUrl, paymentIntentId } = await updatePaymentAttemptIfNeeded(moneyhubPaymentId, paymentSubmissionId, paymentAttemptStatus)

      if (error) {
        next(error)
        return
      }

      res.status(200).json({ redirectUrl, paymentAttemptStatus, paymentIntentId })
    } catch (err) {
      console.log(err)
    }
  }
}
