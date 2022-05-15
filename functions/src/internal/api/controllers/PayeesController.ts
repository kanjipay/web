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
      const { merchantId, crezcoUserId } = req.body;
      const merchantDoc = await fetchDocument(Collection.MERCHANT, merchantId);
      const payeeId = merchantDoc.merchant.payeeId;
      const payeeDoc = await fetchDocument(Collection.PAYEE, payeeId);
      const { accountNumber, sortCode, companyName } = payeeDoc.payee;
      console.log({ accountNumber, sortCode, companyName, payeeId });
      const moneyhubPayeeData = await createPayee(
        accountNumber,
        sortCode,
        companyName,
        payeeId
      );
      console.log(moneyhubPayeeData);
      const update = {
        approvalStatus: PayeeApprovalStatus.APPROVED,
        reviewedAt: firestore.FieldValue.serverTimestamp(),
        moneyhub: { payeeId: moneyhubPayeeData.id },
        crezco: { userId: crezcoUserId },
      };

      await db().collection(Collection.PAYEE).doc(payeeId).update(update);

      return res.sendStatus(200);
    } catch (err) {
      console.log(err);
      res.sendStatus(500);
    }
  };
}
