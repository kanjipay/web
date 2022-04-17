import Collection from "../../../../shared/enums/Collection";
import BaseController from "../../../../shared/BaseController";
import PaymentAttemptStatus from "../../../../shared/enums/PaymentAttemptStatus";
import { db } from "../../../../shared/utils/admin";
import { ErrorHandler, HttpError, HttpStatusCode } from "../../../../shared/utils/errors";
import OrderStatus from "../../../../shared/enums/OrderStatus";
import LoggingController from "../../../../shared/utils/loggingClient";
import { getPayees, generateMoneyhubPaymentAuthUrl, createPayee, processAuthSuccess } from "../../../../shared/utils/moneyhubClient";
import { v4 as uuid } from "uuid";
import * as jwt from "jsonwebtoken";

export default class PaymentAttemptsController extends BaseController {
  create = async (req, res, next) => {
    try {
      const order = req.order;
      const { userId, merchantId, total } = order;
      const orderId = order.id;
      const { moneyhub, deviceId, stateId } = req.body;
      const isLocalEnvironment = process.env.IS_LOCAL === "TRUE"

      const loggingClient = new LoggingController("Payment Attempts Controller");
      loggingClient.log(
        "Payment Attempt Initiated",
        {
          environment: process.env.ENVIRONMENT,
          envClientURL: process.env.CLIENT_URL,
          isLocalEnvironment,
        },
        {
          merchantId,
          deviceId,
          userId,
          orderId,
          total,
        }
      );

      if (order.status !== OrderStatus.PENDING) {
        next(
          new HttpError(
            HttpStatusCode.BAD_REQUEST,
            `That order was ${order.status.toLowerCase()}`
          )
        );
        return;
      }

      // Search for merchant on order and load in sort code/acc number

      const merchantDoc = await db()
        .collection(Collection.MERCHANT)
        .doc(merchantId)
        .get()
        .catch(
          new ErrorHandler(HttpStatusCode.INTERNAL_SERVER_ERROR, next).handle
        );

      if (!merchantDoc) {
        next(
          new HttpError(HttpStatusCode.NOT_FOUND, "Couldn't find that merchant")
        );
        return;
      }

      const merchant: any = { id: merchantDoc.id, ...merchantDoc.data() }

      if (merchant.status !== "OPEN") {
        next(new HttpError(HttpStatusCode.BAD_REQUEST, "The merchant isn't open at the moment"));
        return;
      }

      loggingClient.log("Merchant data fetched", merchant);

      const paymentAttemptId = uuid()

      let { bankId } = moneyhub
      const { moneyhubPayeeId, moneyhubPayeeIdLocal, paymentName } = merchant
      const payeeId = process.env.IS_LOCAL === "TRUE" ? moneyhubPayeeIdLocal : moneyhubPayeeId

      if (process.env.ENVIRONMENT !== "PROD") {
        bankId = "5233db2a04fe41dd01d3308ea92e8bd7"
      }

      const authUrl = await generateMoneyhubPaymentAuthUrl(
        payeeId,
        paymentName,
        bankId,
        stateId,
        total,
        paymentAttemptId
      );

      // Write payment attempt object to database

      loggingClient.log("Make payment function complete");

      const paymentAttemptData = {
        orderId,
        merchantId,
        status: PaymentAttemptStatus.PENDING,
        createdAt: new Date(),
        deviceId,
        userId,
        amount: total,
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
        paymentAttemptId,
      });
    } catch (err) {
      console.log(err)
      return res.sendStatus(500)
    }
  };

  swapCode = async (req, res, next) => {
    try {
      const { code, state, idToken, paymentAttemptId } = req.body
      const { id_token } = await processAuthSuccess(code, state, idToken, paymentAttemptId)

      const decoded = jwt.decode(id_token, { complete: true })
      const paymentId = decoded.payload["mh:payment"]

      await db()
        .collection(Collection.PAYMENT_ATTEMPT)
        .doc(paymentAttemptId)
        .update({
          "moneyhub.paymentId": paymentId
        })

      return res.sendStatus(200)
    } catch (err) {
      console.log(err)
      return res.sendStatus(500)
    }
  }

  listPayees = async (req, res, next) => {
    try {
      const payees = await getPayees()
      return res.status(200).json({ payees })
    } catch (err) {
      console.log(err)
      res.sendStatus(500)
    }
  }

  addPayee = async (req, res, next) => {
    try {
      const { accountNumber, sortCode, name } = req.body
      const id = uuid()
      await createPayee(accountNumber, sortCode, name, id)
      return res.sendStatus(200)
    } catch (err) {
      console.log(err)
      res.sendStatus(500)
    }
  }
}
