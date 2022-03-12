import Collection from "../enums/Collection"
import BaseController from "./BaseController"
import PaymentAttemptStatus from "../enums/PaymentAttemptStatus"
import { db } from "../app"
import { ErrorHandler, HttpError, HttpStatusCode } from "../utils/errors"
import { plaidClient } from "../utils/plaid"

export default class PaymentAttemptsController extends BaseController {
  create = async (req, res, next) => {
    const order = req.order
    const merchantId = order.merchant_id

    // Search for merchant on order and load in sort code/acc number

    const merchantDoc = await db
      .collection(Collection.MERCHANT.name)
      .doc(merchantId)
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
    }).catch(err => {
      console.log(err)
    })

    console.log(recipientResponse)

    const { recipient_id } = recipientResponse


    // Create a payment

    const paymentResponse = await plaidClient.paymentInitiationPaymentCreate({
      recipient_id,
      reference: "Mercado",
      amount: {
        value: (order.total / 100).toFixed(2),
        currency: "GBP"
      }
    }).catch(err => {
      console.log(err)
    })

    console.log(paymentResponse)

    const { payment_id } = paymentResponse


    // Create a link token for the customer to go through bank auth
    const linkResponse = await plaidClient.linkTokenCreate({
      user: {
        client_user_id: device_id
      },
      client_name: "Mercado",
      products: ["payment_initiation"],
      country_codes: ["GB"],
      language: "en",
      webhook: "insert link here",
      payment_initiation: {
        payment_id
      }
    }).catch(err => {
      console.log(err)
    })

    console.log(linkResponse)

    const { link_token, expiration } = linkResponse


    // Write payment attempt object to database

    const paymentAttemptRef = await db
      .collection(Collection.PAYMENT_ATTEMPT.name)
      .add({
        payment_id,
        order_id: order.id,
        status: PaymentAttemptStatus.PENDING,
        created_at: new Date(),
        device_id: order.device_id,
        amount: order.total,
      })
      .catch(new ErrorHandler(HttpStatusCode.INTERNAL_SERVER_ERROR, next).handle)

    await db
      .doc(paymentAttemptRef)
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