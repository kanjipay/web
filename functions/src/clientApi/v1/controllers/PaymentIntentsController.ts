import Collection from "../../../shared/enums/Collection";
import BaseController from "../../../shared/BaseController";
import { firestore } from "firebase-admin";
import { PayeeApprovalStatus } from "./PayeesController";
import { fetchDocument } from "../../../shared/utils/fetchDocument";
import { addDocument } from "../../../shared/utils/addDocument";
import { PaymentIntentStatus } from "../../../shared/enums/PaymentIntentStatus";

export default class PaymentIntentsController extends BaseController {
  createPaymentIntent = async (req, res, next) => {
    const { amount, successUrl, cancelledUrl, payeeId } = req.body
    const { clientId } = req
    const { payee, payeeError } = await fetchDocument(Collection.PAYEE, payeeId, { approvalStatus: PayeeApprovalStatus.APPROVED })

    if (payeeError) {
      next(payeeError)
      return
    }

    const { moneyhub, companyName } = payee
    const moneyhubPayeeId = moneyhub.payeeId

    const { paymentIntentId } = await addDocument(Collection.PAYMENT_INTENT, {
      amount,
      successUrl,
      cancelledUrl,
      clientId,
      payee: {
        payeeId,
        moneyhubPayeeId,
        companyName
      },
      status: PaymentIntentStatus.PENDING,
      createdAt: firestore.FieldValue.serverTimestamp(),
    })

    res.status(200).json({
      checkoutUrl: `${process.env.CLIENT_URL}/checkout/pi/${paymentIntentId}/choose-bank`,
      paymentIntentId
    })
  }
}