import Collection from "../../../../shared/enums/Collection";
import { db } from "../../../../shared/utils/admin";
import BaseController from "../../../../shared/BaseController";
import { HttpError, HttpStatusCode } from "../../../../shared/utils/errors";

export default class PaymentsController extends BaseController {
  createPaymentIntent = async (req, res, next) => {
    const { amount, successUrl, failureUrl, cancelledUrl, clientId } = req.body

    const paymentIntentDoc = await db()
      .collection(Collection.PAYMENT_INTENT)
      .add({
        amount,
        successUrl,
        failureUrl,
        cancelledUrl,
        clientId
      })

    const paymentIntentId = paymentIntentDoc.id

    res.status(200).json({
      url: `${process.env.CLIENT_URL}/checkout/${paymentIntentId}/choose-bank`
    })
  }

  createRefundIntent = async (req, res, next) => {
    const { orderId } = req.body

    const orderDoc = await db()
      .collection(Collection.ORDER)
      .doc(orderId)
      .get()

    if (!orderDoc.exists) {
      next(
        new HttpError(
          HttpStatusCode.NOT_FOUND,
          "Something went wrong",
          `Order with id ${orderId} not found`
        )
      );
      return
    }

    const { isReversible } = orderDoc.data()

    if (!isReversible) {
      next(
        new HttpError(
          HttpStatusCode.BAD_REQUEST,
          "Something went wrong",
          `Order with id ${orderId} is not reversible`
        )
      );
    }

    res.status(200).json({
      url: `${process.env.CLIENT_URL}/checkout/abc`
    })

  }
}