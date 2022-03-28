import Collection from "../../enums/Collection";
import BaseController from "./BaseController";
import PaymentAttemptStatus from "../../enums/PaymentAttemptStatus";
import { db } from "../../utils/admin";
import { ErrorHandler, HttpError, HttpStatusCode } from "../../utils/errors";
import {
  createLinkToken,
  createPayment,
  createRecipient,
} from "../../utils/plaidClient";
import OrderStatus from "../../enums/OrderStatus";
import {
  createAccessToken,
  createPaymentWithAccessToken,
} from "../../utils/truelayerClient";
import { OpenBankingProvider } from "../../enums/OpenBankingProvider";
import * as functions from "firebase-functions";
import { v4 as uuid } from "uuid";

async function makePlaidPayment(
  accountNumber: string,
  sortCode: string,
  paymentName: string,
  amount: number,
  userId: string
) {
  const recipientId = await createRecipient(
    accountNumber,
    sortCode,
    paymentName
  );

  const paymentId = await createPayment(recipientId, amount);

  const linkResponse = await createLinkToken(paymentId, userId);

  const linkToken = linkResponse.link_token;
  const linkExpiration = linkResponse.expiration;

  return {
    providerData: {
      paymentId,
    },
    providerPrivateData: {
      recipientId,
      linkToken,
      linkExpiration,
    },
    providerReturnData: {
      linkToken,
    },
  };
}

async function makeTruelayerPayment(
  accountNumber: string,
  sortCode: string,
  paymentName: string,
  amount: number,
  userId: string,
  paymentAttemptId: string
) {
  const accessToken = await createAccessToken();

  const { paymentId, resourceToken } = await createPaymentWithAccessToken(
    accessToken,
    amount,
    paymentName,
    sortCode,
    accountNumber,
    userId
  );

  return {
    providerData: {
      paymentId,
    },
    providerPrivateData: {
      resourceToken,
    },
    providerReturnData: {
      resourceToken,
      paymentId,
    },
  };
}

async function makeMoneyhubPayment(
  accountNumber: string,
  sortCode: string,
  paymentName: string,
  amount: number,
  userId: string
) {
  return {
    providerData: {},
    providerPrivateData: {},
    providerReturnData: {},
  };
}

async function makePayment(
  provider: OpenBankingProvider,
  accountNumber: string,
  sortCode: string,
  paymentName: string,
  amount: number,
  userId: string,
  paymentAttemptId: string
) {
  let functionPromise;

  switch (provider) {
    case OpenBankingProvider.PLAID:
      functionPromise = makePlaidPayment(
        accountNumber,
        sortCode,
        paymentName,
        amount,
        userId
      );
      break;
    case OpenBankingProvider.TRUELAYER:
      functionPromise = makeTruelayerPayment(
        accountNumber,
        sortCode,
        paymentName,
        amount,
        userId,
        paymentAttemptId
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
    const correlationId = uuid();

    functions.logger.log("Payment Attempts API Invoked", {
      correlationId: correlationId,
      total: total,
      merchantId: merchantId,
      deviceId: deviceId,
      orderId: orderId,
      environment: process.env.ENVIRONMENT,
      clientURL: process.env.CLIENT_URL,
    });


    const { openBankingProvider } = req.body;

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

    const { providerData, providerPrivateData, providerReturnData } =
      await makePayment(
        openBankingProvider,
        accountNumber,
        sortCode,
        paymentName,
        total,
        deviceId,
        orderId
      );

    // Write payment attempt object to database
    const providerKey = openBankingProvider.toLowerCase();

    const paymentAttemptRef = await db()
      .collection(Collection.PAYMENT_ATTEMPT)
      .add({
        [providerKey]: providerData,
        orderId,
        merchantId,
        status: PaymentAttemptStatus.PENDING,
        createdAt: new Date(),
        deviceId,
        amount: total,
      });
    // .catch(new ErrorHandler(HttpStatusCode.INTERNAL_SERVER_ERROR, next).handle)

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

    return res.status(200).json({
      [providerKey]: providerReturnData,
      paymentAttemptId,
    });
  };
}
