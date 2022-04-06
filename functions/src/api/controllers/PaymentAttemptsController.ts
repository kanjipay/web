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
import { PaymentProvider } from "../../enums/PaymentProvider";
import * as functions from "firebase-functions";
import { v4 as uuid } from "uuid";

async function makePlaidPayment(
  accountNumber: string,
  sortCode: string,
  paymentName: string,
  amount: number,
  userId: string,
  correlationId: string,
  isLocalEnvironment: boolean
) {
  functions.logger.log("Make Plaid Payment Function Invoked", {
    correlationId: correlationId,
    accountNumber: accountNumber,
    sortCode: sortCode,
    paymentName: paymentName,
    amount: amount,
    userId: userId,
    isLocalEnvironment: isLocalEnvironment,
  });

  const recipientId = await createRecipient(
    accountNumber,
    sortCode,
    paymentName
  );

  functions.logger.log("Make Plaid recipientId complete", {
    correlationId: correlationId,
    recipientId: recipientId,
  });

  const paymentId = await createPayment(recipientId, amount);

  functions.logger.log("Make Plaid recipientId complete", {
    correlationId: correlationId,
    paymentId: paymentId,
  });

  const linkResponse = await createLinkToken(
    paymentId,
    userId,
    isLocalEnvironment,
    correlationId
  );

  const linkToken = linkResponse.link_token;
  const linkExpiration = linkResponse.expiration;

  functions.logger.log("Make Plaid payment request complete", {
    correlationId: correlationId,
    linkToken: linkToken,
  });

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
  paymentAttemptId: string,
  correlationId: string
) {
  functions.logger.log("Make Truelayer Payment Function Invoked", {
    correlationId: correlationId,
    paymentAttemptId: paymentAttemptId,
  });

  const accessToken = await createAccessToken();

  functions.logger.log("Truelayer Access Token Created", {
    correlationId: correlationId,
    paymentAttemptId: paymentAttemptId,
  });

  const { paymentId, resourceToken } = await createPaymentWithAccessToken(
    accessToken,
    amount,
    paymentName,
    sortCode,
    accountNumber,
    userId
  );

  functions.logger.log("Created Truelayer Payment with Access Token", {
    correlationId: correlationId,
    paymentAttemptId: paymentAttemptId,
  });

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

async function makeOpenbankingPayment(
  provider: PaymentProvider,
  accountNumber: string,
  sortCode: string,
  paymentName: string,
  amount: number,
  userId: string,
  paymentAttemptId: string,
  correlationId: string,
  isLocalEnvironment: boolean
) {
  let functionPromise;

  switch (provider) {
    case PaymentProvider.PLAID:
      functionPromise = makePlaidPayment(
        accountNumber,
        sortCode,
        paymentName,
        amount,
        userId,
        correlationId,
        isLocalEnvironment
      );
      break;
    case PaymentProvider.TRUELAYER:
      functionPromise = makeTruelayerPayment(
        accountNumber,
        sortCode,
        paymentName,
        amount,
        userId,
        paymentAttemptId,
        correlationId
      );
      break;
    case PaymentProvider.MONEYHUB:
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
    const { PaymentProvider, isLocalEnvironment } = req.body;

    functions.logger.log("Payment Attempts API Invoked", {
      correlationId: correlationId,
      total: total,
      merchantId: merchantId,
      deviceId: deviceId,
      orderId: orderId,
      PaymentProvider: PaymentProvider,
      environment: process.env.ENVIRONMENT,
      envClientURL: process.env.CLIENT_URL,
      isLocalEnvironment: isLocalEnvironment,
    });

    const providers = Object.keys(PaymentProvider);

    if (!PaymentProvider || !providers.includes(PaymentProvider)) {
      next(
        new HttpError(
          HttpStatusCode.BAD_REQUEST,
          "Something went wrong",
          `Invalid payment provider ${PaymentProvider} in request body. Should be in: ${providers}`
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
    if (!(PaymentProvider === "STRIPE")) {
      const { accountNumber, sortCode, paymentName } = merchantDoc.data();
      functions.logger.log("Merchant Doc Retrieved", {
        correlationId: correlationId,
        total: total,
        merchantId: merchantId,
        orderId: orderId,
        openBankingProvider: PaymentProvider,
        accountNumber: accountNumber,
        sortCode: sortCode,
        paymentName: paymentName,

        const { providerData, providerPrivateData, providerReturnData } =
        await makeOpenbankingPayment(
          PaymentProvider,
          accountNumber,
          sortCode,
          paymentName,
          total,
          deviceId,
          orderId,
          correlationId,
          isLocalEnvironment
        );
      });
    }



    // Write payment attempt object to database
    const providerKey = PaymentProvider.toLowerCase();

    functions.logger.log("Make Payment Function Completed", {
      correlationId: correlationId,
    });

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

    functions.logger.log("Payment Attempt Doc Added", {
      correlationId: correlationId,
      paymentAttemptData: paymentAttemptData,
    });

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

    functions.logger.log("Payment Attempt Controller Finished returning 200", {
      correlationId: correlationId,
      paymentAttemptId: paymentAttemptId,
    });

    return res.status(200).json({
      [providerKey]: providerReturnData,
      paymentAttemptId,
    });
  };
}
