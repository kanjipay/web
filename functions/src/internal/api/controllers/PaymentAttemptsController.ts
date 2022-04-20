import Collection from "../../../shared/enums/Collection";
import BaseController from "../../../shared/BaseController";
import PaymentAttemptStatus from "../../../shared/enums/PaymentAttemptStatus";
import { db } from "../../../shared/utils/admin";
import { ErrorHandler, HttpError, HttpStatusCode } from "../../../shared/utils/errors";
import LoggingController from "../../../shared/utils/loggingClient";
import { generateMoneyhubPaymentAuthUrl, processAuthSuccess } from "../../../shared/utils/moneyhubClient";
import { v4 as uuid } from "uuid";
import * as jwt from "jsonwebtoken";
import { fetchDocument } from "../../../shared/utils/fetchDocument";
import { firestore } from "firebase-admin";
import { PaymentIntentStatus } from "../../../shared/enums/PaymentIntentStatus";

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
      const bankId = process.env.ENVIRONMENT !== "PROD" ? "5233db2a04fe41dd01d3308ea92e8bd7" : moneyhubBankId
      
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

      const { stateObject, stateError } = await fetchDocument(Collection.STATE, stateId)

      if (stateError) {
        next(stateError)
        return
      }

      const { clientState } = stateObject.additionalData

      const { id_token } = await processAuthSuccess(code, state, idToken, paymentAttemptId, stateId, clientState)

      const decoded = jwt.decode(id_token, { complete: true })
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
}
