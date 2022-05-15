import Collection from "../../../shared/enums/Collection";
import { db } from "../../../shared/utils/admin";
import { createPayee } from "../../../shared/utils/moneyhubClient";
import BaseController from "../../../shared/BaseController";
import { PayeeApprovalStatus as PayeeApprovalStatus } from "../../../shared/enums/PayeeApprovalStatus";
import { fetchDocument } from "../../../shared/utils/fetchDocument";
import { firestore } from "firebase-admin";

export default class PayeesController extends BaseController {
  update = async (req, res, next) => {
    try {
      const { merchantId, crezcoUserId } = req.body
      const {payeeId} = await fetchDocument(Collection.MERCHANT, merchantId)
      const { payee, payeeError } = await fetchDocument(Collection.PAYEE, payeeId, { 
        approvalStatus: PayeeApprovalStatus.PENDING
      })
      if (payeeError) {
        next(payeeError)
        return
      }
      const { accountNumber, sortCode, companyName } = payee
      const moneyhubPayeeData = await createPayee(accountNumber, sortCode, companyName, payeeId)
      const update = { 
        approvalStatus: PayeeApprovalStatus.APPROVED,
        reviewedAt: firestore.FieldValue.serverTimestamp(),
        moneyhub:  { payeeId: moneyhubPayeeData.id },
        crezco: { userId: crezcoUserId }
      }

      await db()
        .collection(Collection.PAYEE)
        .doc(payeeId)
        .update(update)

      return res.sendStatus(200)
    } catch (err) {
      console.log(err.response.data)
      console.log(err.response.data.errors)
      res.sendStatus(500)
    }
  }
}