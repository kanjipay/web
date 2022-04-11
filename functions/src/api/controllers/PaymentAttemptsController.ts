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
import { getPaymentAuthUrl, makeMoneyhubPayment } from "../../utils/moneyhubClient";

async function makePayment(
  provider: OpenBankingProvider,
  accountNumber: string,
  sortCode: string,
  paymentName: string,
  amount: number,
  userId: string,
  paymentAttemptId: string,
  isLocalEnvironment: boolean,
  loggingClient
) {
  let functionPromise;

  switch (provider) {
    case OpenBankingProvider.PLAID:
      functionPromise = makePlaidPayment(
        accountNumber,
        sortCode,
        paymentName,
        amount,
        userId,
        loggingClient,
        isLocalEnvironment
      );
      break;
    case OpenBankingProvider.TRUELAYER:
      functionPromise = makeTruelayerPayment(
        accountNumber,
        sortCode,
        paymentName,
        amount,
        userId,
        paymentAttemptId,
        loggingClient
      );
      break;
    case OpenBankingProvider.MONEYHUB:
      functionPromise = makeMoneyhubPayment(
        accountNumber,
        sortCode,
        paymentName,
        amount,
        userId
      );
      break;
  }

  return await functionPromise;
}

export default class PaymentAttemptsController extends BaseController {
  create = async (req, res, next) => {
    const order = req.order;
    const { deviceId, merchantId, total } = order;
    const orderId = order.id;
    const { openBankingProvider, isLocalEnvironment } = req.body;

    const loggingClient = new LoggingController("Payment Attempts Controller");
    loggingClient.log(
      "Payment Attempt Initiated",
      {
        openBankingProvider: openBankingProvider,
        environment: process.env.ENVIRONMENT,
        envClientURL: process.env.CLIENT_URL,
        isLocalEnvironment: isLocalEnvironment,
      },
      {
        merchantId: merchantId,
        deviceId: deviceId,
        orderId: orderId,
        total: total,
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

    const { accountNumber, sortCode, paymentName } = merchantDoc.data();

    loggingClient.log("Merchant data fetched", {
      accountNumber: accountNumber,
      sortCode: sortCode,
      paymentName: paymentName,
    });

    const { providerData, providerPrivateData, providerReturnData } =
      await makePayment(
        openBankingProvider,
        accountNumber,
        sortCode,
        paymentName,
        total,
        deviceId,
        orderId,
        isLocalEnvironment,
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
      amount: total,
    };

    const paymentAttemptRef = await db()
      .collection(Collection.PAYMENT_ATTEMPT)
      .add(paymentAttemptData);
    // .catch(new ErrorHandler(HttpStatusCode.INTERNAL_SERVER_ERROR, next).handle)

    loggingClient.log("Payment attempt doc added", { paymentAttemptData });

    await db()
      .doc(paymentAttemptRef.path)
      .collection("Private")
      .add({
        [providerKey]: providerPrivateData,
      })
      .catch(
        new ErrorHandler(HttpStatusCode.INTERNAL_SERVER_ERROR, next).handle
      );

    // Return the link token and payment attempt id for the frontend to use

    const paymentAttemptId = paymentAttemptRef.id;

    loggingClient.log("Payment Attempt Controller Finished returning 200", {
      paymentAttemptId,
    });

    return res.status(200).json({
      [providerKey]: providerReturnData,
      paymentAttemptId,
    });
  };

  createAuthUrl = async (req, res, next) => {
    const order = req.order;
    const { merchantId, total } = order
    const { bankId } = req.body

    const merchantDoc = await db()
      .collection(Collection.MERCHANT)
      .doc(merchantId)
      .get()
      .catch(new ErrorHandler(HttpStatusCode.INTERNAL_SERVER_ERROR, next).handle);

    if (!merchantDoc) {
      next(new HttpError(HttpStatusCode.NOT_FOUND, "Couldn't find that merchant"));
      return;
    }

    const { moneyhubPayeeId, status, displayName } = merchantDoc.data()

    if (status !== "OPEN") {
      next(new HttpError(HttpStatusCode.BAD_REQUEST, "The merchant isn't open at the moment"));
      return;
    }

    if (!moneyhubPayeeId) {
      next(new HttpError(HttpStatusCode.INTERNAL_SERVER_ERROR));
      return;
    }

    const authUrl = await getPaymentAuthUrl(bankId, moneyhubPayeeId, displayName, total)

    res.sendStatus(200).json({ authUrl })
  }
}
