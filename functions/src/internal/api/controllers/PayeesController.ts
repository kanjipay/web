import Collection from "../../../shared/enums/Collection";
import { db } from "../../../shared/utils/admin";
import { createPayee } from "../../../shared/utils/moneyhubClient";
import BaseController from "../../../shared/BaseController";
import { PayeeApprovalStatus as PayeeApprovalStatus } from "../../../clientApi/v1/controllers/PayeesController";
import { fetchDocument } from "../../../shared/utils/fetchDocument";
import { firestore } from "firebase-admin";

export default class PayeesController extends BaseController {
  review = async (req, res, next) => {
    try {
      const { payeeId } = req.params
      const { approvalStatus } = req.body

      const { payee, payeeError } = await fetchDocument(Collection.PAYEE, payeeId)

      if (payeeError) {
        next(payeeError)
        return
      }

      const { accountNumber, sortCode, companyName } = payee

      const update = { 
        approvalStatus,
        reviewedAt: firestore.FieldValue.serverTimestamp()
      }

      if (approvalStatus == PayeeApprovalStatus.APPROVED) {
        const moneyhubPayeeData = await createPayee(accountNumber, sortCode, companyName, payeeId)
        update["moneyhub"] = { payeeId: moneyhubPayeeData.id }
      }

      await db()
        .collection(Collection.PAYEE)
        .doc(payeeId)
        .update(update)

      return res.sendStatus(200)
    } catch (err) {
      console.log(err)
      res.sendStatus(500)
    }
  }
}