import Collection from "../../../shared/enums/Collection";
import { db } from "../../../shared/utils/admin";
import { createPayee } from "../../../shared/utils/moneyhubClient";
import BaseController from "../../../shared/BaseController";
import { PayeeApprovalStatus as PayeeApprovalStatus } from "../../../shared/enums/PayeeApprovalStatus";
import { fetchDocument } from "../../../shared/utils/fetchDocument";
import { firestore } from "firebase-admin";
import { createUser } from "../../../shared/utils/crezcoClient";

export default class PayeesController extends BaseController {
  review = async (req, res, next) => {
    try {
      const { payeeId } = req.params
      const { approvalStatus } = req.body

      const { payee, payeeError } = await fetchDocument(Collection.PAYEE, payeeId, { 
        approvalStatus: PayeeApprovalStatus.PENDING
      })

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

        const crezcoUserId = await createUser(payeeId, companyName, "matt.e.ffrench@gmail.com")
        update["crezco"] = { userId: crezcoUserId }
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