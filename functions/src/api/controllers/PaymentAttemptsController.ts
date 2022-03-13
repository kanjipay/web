import Collection from "../../enums/Collection"
import BaseController from "./BaseController"
import PaymentAttemptStatus from "../../enums/PaymentAttemptStatus"
import { db } from "../../admin"
import { ErrorHandler, HttpError, HttpStatusCode } from "../../utils/errors"
import { plaidClient } from "../../utils/plaid"
import OrderStatus from "../../enums/OrderStatus"
import { Products, CountryCode, PaymentAmountCurrency } from "plaid"

export default class PaymentAttemptsController extends BaseController {
  create = async (req, res, next) => {
    const order = req.order
    const { device_id, merchant_id, total } = order
    const orderId = order.id

    if (order.status !== OrderStatus.PENDING) {
      next(new HttpError(HttpStatusCode.BAD_REQUEST, `That order was ${order.status.toLowerCase()}`))
      return
    }

    // Search for merchant on order and load in sort code/acc number

    const merchantDoc = await db
      .collection(Collection.MERCHANT)
      .doc(merchant_id)
      .get()
      .catch(new ErrorHandler(HttpStatusCode.INTERNAL_SERVER_ERROR, next).handle)

    if (!merchantDoc) {
      next(new HttpError(HttpStatusCode.NOT_FOUND, "Couldn't find that merchant"))
      return
    }
    
    const { account_number, sort_code, payment_name } = merchantDoc.data()

    // Create a recipient for payment initiation

    const recipientResponse = await plaidClient.paymentInitiationRecipientCreate({
      name: payment_name,
      bacs: {
        account: account_number,
        sort_code
      }
    })

    const { recipient_id } = recipientResponse.data


    // Create a payment

    const paymentResponse = await plaidClient.paymentInitiationPaymentCreate({
      recipient_id,
      reference: "Mercado",
      amount: {
        value: total / 100,
        currency: PaymentAmountCurrency.Gbp
      }
    })

    const { payment_id } = paymentResponse.data


    // Create a link token for the customer to go through bank auth
    const linkResponse = await plaidClient.linkTokenCreate({
      user: {
        client_user_id: device_id
      },
      client_name: "Mercado",
      products: [Products.PaymentInitiation],
      country_codes: [CountryCode.Gb],
      language: "en",
      webhook: process.env.WEBHOOK_URL,
      payment_initiation: {
        payment_id
      }
    })

    const { link_token, expiration } = linkResponse.data


    // Write payment attempt object to database

    const paymentAttemptRef = await db
      .collection(Collection.PAYMENT_ATTEMPT)
      .add({
        payment_id,
        order_id: orderId,
        merchant_id,
        status: PaymentAttemptStatus.PENDING,
        created_at: new Date(),
        device_id,
        amount: total,
      })
      // .catch(new ErrorHandler(HttpStatusCode.INTERNAL_SERVER_ERROR, next).handle)

    await db
      .doc(paymentAttemptRef.path)
      .collection("Private")
      .add({
        recipient_id,
        link_token,
        link_expiration: expiration
      })
      .catch(new ErrorHandler(HttpStatusCode.INTERNAL_SERVER_ERROR, next).handle)


    // Return the link token and payment attempt id for the frontend to use

    const payment_attempt_id = paymentAttemptRef.id

    return res.status(200).json({ link_token, payment_attempt_id })
  }
}