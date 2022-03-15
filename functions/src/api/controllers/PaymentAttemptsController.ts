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
    const { device_id, merchant_id, total } = order;
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
      .doc(merchant_id)
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

    const { account_number, sort_code, payment_name } = merchantDoc.data();

    const { recipient_id } = await createRecipient(
      account_number,
      sort_code,
      payment_name
    );
    const { payment_id } = await createPayment(recipient_id, total);
    const { link_token, expiration } = await createLinkToken(
      payment_id,
      device_id
    );

    // Write payment attempt object to database

    const paymentAttemptRef = await db()
      .collection(Collection.PAYMENT_ATTEMPT)
      .add({
        payment_id,
        order_id: orderId,
        merchant_id,
        status: PaymentAttemptStatus.PENDING,
        created_at: new Date(),
        device_id,
        amount: total,
      });
    // .catch(new ErrorHandler(HttpStatusCode.INTERNAL_SERVER_ERROR, next).handle)

    await db()
      .doc(paymentAttemptRef.path)
      .collection("Private")
      .add({
        recipient_id,
        link_token,
        link_expiration: expiration,
      })
      .catch(
        new ErrorHandler(HttpStatusCode.INTERNAL_SERVER_ERROR, next).handle
      );

    // Return the link token and payment attempt id for the frontend to use

    const payment_attempt_id = paymentAttemptRef.id;

    return res.status(200).json({ link_token, payment_attempt_id });
  };
}
