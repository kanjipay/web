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

export default class PaymentAttemptsController extends BaseController {
  create = async (req, res, next) => {
    const order = req.order;
    const { deviceId, merchantId, total } = order;
    const orderId = order.id;

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

    const recipientId = await createRecipient(
      accountNumber,
      sortCode,
      paymentName
    );

    const paymentId = await createPayment(recipientId, total);

    const linkResponse = await createLinkToken(paymentId, deviceId);

    const linkToken = linkResponse.link_token;
    const linkExpiration = linkResponse.expiration;

    // Write payment attempt object to database

    const paymentAttemptRef = await db()
      .collection(Collection.PAYMENT_ATTEMPT)
      .add({
        paymentId,
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
        recipientId,
        linkToken,
        linkExpiration,
      })
      .catch(
        new ErrorHandler(HttpStatusCode.INTERNAL_SERVER_ERROR, next).handle
      );

    // Return the link token and payment attempt id for the frontend to use

    const paymentAttemptId = paymentAttemptRef.id;

    return res.status(200).json({ linkToken, paymentAttemptId });
  };
}
