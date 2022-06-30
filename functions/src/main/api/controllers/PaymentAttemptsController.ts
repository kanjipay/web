import BaseController from "../../../shared/BaseController";
import Collection from "../../../shared/enums/Collection";
import OrderStatus from "../../../shared/enums/OrderStatus";
import { fetchDocument } from "../../../shared/utils/fetchDocument";
import LoggingController from "../../../shared/utils/loggingClient";
import { v4 as uuid } from "uuid"
import { createPayment, createPaymentDemand, getPaymentStatus } from "../../../shared/utils/crezcoClient";
import PaymentAttemptStatus from "../../../shared/enums/PaymentAttemptStatus";
import { firestore } from "firebase-admin";
import { db } from "../../../shared/utils/admin";
import { ErrorHandler, HttpError, HttpStatusCode } from "../../../shared/utils/errors";
import stripe from "../../../shared/utils/stripeClient";
import { processPaymentUpdate } from "../../webhooks/processPaymentUpdate";
import { StripeStatus } from "../../../shared/enums/StripeStatus";

const crezcoPaymentStatuses = {
  New: PaymentAttemptStatus.PENDING, // Payment has been created internally, authorisation has not been attempted
  Cancelled: PaymentAttemptStatus.CANCELLED, // Payment / bank account selection process was cancelled by the user
  Failed: PaymentAttemptStatus.FAILED, // Bank account selection process failed for some reason (failed to get redirect URL, bank failed to authorise user, etc)
  Denied: PaymentAttemptStatus.FAILED, // Bank denied the payment - it failed a technical validation check
  Authorised: PaymentAttemptStatus.PENDING, // User completed bank account selection and authorised the transaction. Bank has not yet processed the request
  Accepted: PaymentAttemptStatus.ACCEPTED, // Payment accepted but funds have not yet transferred
  Blocked: PaymentAttemptStatus.PENDING, // ??? is this the right PaymentAttemptStatus // Payment accepted by Bank, but awaiting further authorisations (multi-auth, or other approval flows)
  Declined: PaymentAttemptStatus.FAILED, // Bank declined the payment
  Completed: PaymentAttemptStatus.SUCCESSFUL
}

export class PaymentAttemptsController extends BaseController {
  createStripe = async (req, res, next) => {
    try {
      const logger = new LoggingController("Create payment attempt with stripe")
      const { orderId, deviceId } = req.body;

      logger.log("Creating payment attempt with stripe", { orderId, deviceId })

      const { order, orderError } = await fetchDocument(Collection.ORDER, orderId, {
        status: OrderStatus.PENDING
      })

      if (orderError) {
        next(orderError)
        return
      }

      logger.log("Got order", { order })

      const { total, currency, merchantId } = order

      logger.log(`Retrieving merchant with id ${merchantId}`)

      const { merchant, merchantError } = await fetchDocument(Collection.MERCHANT, merchantId)

      if (merchantError) {
        next(merchantError)
        return
      }

      logger.log("Got merchant", { merchant })

      const stripeAccountId = merchant.stripe?.accountId

      if (!stripeAccountId || merchant.stripe.status !== StripeStatus.CHARGES_ENABLED) {
        logger.error("Merchant not set up for stripe", { stripe: merchant.stripe })
        const errorMessage = "Merchant is not set up for Stripe"
        next(new HttpError(HttpStatusCode.BAD_REQUEST, errorMessage, errorMessage))
        return
      }

      const stripePaymentIntentData = {
        amount: total,
        currency: currency.toLowerCase(),
        automatic_payment_methods: {
          enabled: true,
        },
      }

      logger.log("Creating stripe payment intent", { stripeAccountId, stripePaymentIntentData })

      const paymentIntent = await stripe.paymentIntents.create(stripePaymentIntentData, { stripeAccount: stripeAccountId })

      logger.log("Stripe payment intent created", { paymentIntent })

      const paymentAttemptId = uuid()

      const clientSecret = paymentIntent.client_secret

      const paymentAttemptData = {
        orderId,
        stripe: {
          paymentIntentId: paymentIntent.id,
        },
        merchantId,
        status: PaymentAttemptStatus.PENDING,
        createdAt: firestore.FieldValue.serverTimestamp(),
        deviceId,
        amount: total,
        currency,
      }

      logger.log("Creating payment attempt", { paymentAttemptData, paymentAttemptId })

      await db()
        .collection(Collection.PAYMENT_ATTEMPT)
        .doc(paymentAttemptId)
        .set(paymentAttemptData)

      logger.log("Payment attempt added");

      return res.status(200).json({ clientSecret, stripeAccountId })

    } catch (err) {
      next(err)
    }
  }

  createCrezco = async (req, res, next) => {
    try {
      const logger = new LoggingController("Create payment attempt with crezco")

      const { orderId, crezcoBankCode, countryCode, deviceId } = req.body;

      logger.log("Creating Crezco payment attempt", { orderId, crezcoBankCode, countryCode, deviceId })

      const { order, orderError } = await fetchDocument(Collection.ORDER, orderId, {
        status: OrderStatus.PENDING
      })

      if (orderError) {
        next(orderError)
        return
      }

      const { total, currency, merchantId } = order

      logger.log("Got order", { order })
      const { merchant, merchantError } = await fetchDocument(Collection.MERCHANT, merchantId)

      logger.log(`Retrieving merchant with id ${merchantId}`)

      if (merchantError) {
        next(merchantError)
        return
      }

      logger.log("Got merchant", { merchant })

      const { crezco, companyName } = merchant
      const crezcoUserId = crezco.userId

      const paymentAttemptId = uuid()

      logger.log("Created paymentAttemptId", { paymentAttemptId })

      logger.log("Creating Crezco payment demand", {
        crezcoUserId,
        paymentAttemptId,
        orderId,
        companyName: companyName.replace(/[^a-zA-Z0-9 \.\-]/, ""),
        total,
        currency
      })
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

  checkCrezcoPayment = async (req, res, next) => {
    try {
      const { paymentAttemptId, paymentDemandId } = req.body

      const crezcoPaymentStatus = await getPaymentStatus(paymentDemandId)

      const paymentAttemptStatus = crezcoPaymentStatuses[crezcoPaymentStatus]
      const isPending = paymentAttemptStatus === PaymentAttemptStatus.PENDING

      if (!isPending) {
        const [, error] = await processPaymentUpdate(paymentAttemptId, paymentAttemptStatus)
        if (error) {
          next(error)
          return
        }
      }
    
      return res.status(200).json({ isPending })
    } catch (err) {
      next(err)
    }
  }
}