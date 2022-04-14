import Collection from "../../enums/Collection";
import BaseController from "./BaseController";
import PaymentAttemptStatus from "../../enums/PaymentAttemptStatus";
import { db } from "../../utils/admin";
import { ErrorHandler, HttpError, HttpStatusCode } from "../../utils/errors";
import { makePlaidPayment } from "../../utils/plaidClient";
import OrderStatus from "../../enums/OrderStatus";
import { makeTruelayerPayment } from "../../utils/truelayerClient";
import { OpenBankingProvider } from "../../enums/OpenBankingProvider";
import LoggingController from "../../utils/loggingClient";
import { getPayees, makeMoneyhubPayment, createPayee, processAuthSuccess } from "../../utils/moneyhubClient";
import { v4 as uuid } from "uuid";
import * as jwt from "jsonwebtoken";

async function makePayment(
  provider: OpenBankingProvider,
  merchant: any,
  amount: number,
  userId: string,
  paymentAttemptId: string,
  args: any = {},
  loggingClient: LoggingController
) {
  let functionPromise: Promise<any>;

  const { accountNumber, sortCode, paymentName } = merchant

  const isLocal = process.env.IS_LOCAL === "TRUE"

  switch (provider) {
    case OpenBankingProvider.PLAID:
      functionPromise = makePlaidPayment(
        accountNumber,
        sortCode,
        paymentName,
        amount,
        userId,
        loggingClient,
        isLocal
      );

      break;
    case OpenBankingProvider.TRUELAYER:
      functionPromise = makeTruelayerPayment(
        accountNumber,
        sortCode,
        paymentName,
        amount,
        userId,
        loggingClient
      );

      break;
    case OpenBankingProvider.MONEYHUB:
      const { bankId, stateId } = args
      const { moneyhubPayeeId, moneyhubPayeeIdLocal } = merchant
      const payeeId = process.env.IS_LOCAL === "TRUE" ? moneyhubPayeeIdLocal : moneyhubPayeeId

      functionPromise = makeMoneyhubPayment(
        payeeId,
        paymentName,
        bankId,
        stateId,
        amount,
        paymentAttemptId
      );

      break;
  }

  return await functionPromise;
}

export default class PaymentAttemptsController extends BaseController {
  create = async (req, res, next) => {
    try {
      const order = req.order;
      const { userId, merchantId, total } = order;
      const orderId = order.id;
      const { openBankingProvider, args, deviceId } = req.body;
      const isLocalEnvironment = process.env.IS_LOCAL === "TRUE"

      const loggingClient = new LoggingController("Payment Attempts Controller");
      loggingClient.log(
        "Payment Attempt Initiated",
        {
          openBankingProvider,
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

      const providers = Object.keys(OpenBankingProvider);

      if (!openBankingProvider || !providers.includes(openBankingProvider)) {
        next(
          new HttpError(
            HttpStatusCode.BAD_REQUEST,
            "Something went wrong",
            `Invalid open banking provider ${openBankingProvider} in request body. Should be in: ${providers}`
          )
        );
        return;
      }

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

      const { providerData, providerPrivateData, providerReturnData } = await makePayment(
        openBankingProvider,
        merchant,
        total,
        deviceId,
        paymentAttemptId,
        args,
        loggingClient
      );

      // Write payment attempt object to database
      const providerKey = openBankingProvider.toLowerCase();

      loggingClient.log("Make payment function complete");

      const paymentAttemptData = {
        [providerKey]: providerData,
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

      await db()
        .collection(Collection.PAYMENT_ATTEMPT)
        .doc(paymentAttemptId)
        .collection("Private")
        .add({
          [providerKey]: providerPrivateData,
        })
        .catch(
          new ErrorHandler(HttpStatusCode.INTERNAL_SERVER_ERROR, next).handle
        );

      loggingClient.log("Payment Attempt Controller Finished returning 200", {
        paymentAttemptId,
      });

      return res.status(200).json({
        [providerKey]: providerReturnData,
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
