import BaseController from "../../../shared/BaseController";
import Collection from "../../../shared/enums/Collection";
import OrderStatus from "../../../shared/enums/OrderStatus";
import { fetchDocument } from "../../../shared/utils/fetchDocument";
import LoggingController from "../../../shared/utils/loggingClient";
import { v4 as uuid } from "uuid"
import { createPayment, createPaymentDemand } from "../../../shared/utils/crezcoClient";
import PaymentAttemptStatus from "../../../shared/enums/PaymentAttemptStatus";
import { firestore } from "firebase-admin";
import { db } from "../../../shared/utils/admin";
import { ErrorHandler, HttpStatusCode } from "../../../shared/utils/errors";

export class PaymentAttemptsController extends BaseController {
  createCrezco = async (req, res, next) => {
    try {
      const logger = new LoggingController("Create payment attempt with crezco")

      const { orderId, crezcoBankCode, countryCode, deviceId } = req.body;

      logger.log("Got body vars", {}, { orderId, crezcoBankCode, deviceId })

      const { order, orderError } = await fetchDocument(Collection.ORDER, orderId, {
        status: OrderStatus.PENDING
      })

      if (orderError) {
        next(orderError)
        return
      }

      const { total, currency, merchantId } = order

      const { merchant, merchantError } = await fetchDocument(Collection.MERCHANT, merchantId)

      if (merchantError) {
        next(merchantError)
        return
      }

      const { crezco, companyName } = merchant
      const crezcoUserId = crezco.userId

      const paymentAttemptId = uuid()

      logger.log("Created paymentAttemptId", {}, { paymentAttemptId })

      const { paymentDemandId, payDemandError } = await createPaymentDemand(
        crezcoUserId,
        paymentAttemptId,
        orderId,
        companyName.replace(/[^a-zA-Z0-9 \.\-]/, ""),
        total,
        currency
      )

      if (payDemandError) {
        next(payDemandError)
        return
      }

      logger.log("Created crezco paymentDemandId", {}, { paymentDemandId })

      const { redirectUrl, paymentError } = await createPayment(
        crezcoUserId,
        paymentDemandId,
        paymentAttemptId,
        crezcoBankCode,
        countryCode
      )

      if (paymentError) {
        next(paymentError)
        return
      }

      logger.log("Got crezco redirect url", {}, { redirectUrl })

      const paymentAttemptData = {
        orderId,
        crezco: {
          bankCode: crezcoBankCode,
          paymentDemandId
        },
        merchantId,
        status: PaymentAttemptStatus.PENDING,
        createdAt: firestore.FieldValue.serverTimestamp(),
        deviceId,
        amount: total,
        currency,
      };

      await db()
        .collection(Collection.PAYMENT_ATTEMPT)
        .doc(paymentAttemptId)
        .set(paymentAttemptData)
        .catch(new ErrorHandler(HttpStatusCode.INTERNAL_SERVER_ERROR, next).handle)

      logger.log("Payment attempt doc added", { paymentAttemptData });

      return res.status(200).json({ redirectUrl });
    } catch (err) {
      console.log(err.data?.errors)
      next(err)
    }
  }
}