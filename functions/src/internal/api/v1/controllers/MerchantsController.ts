import Collection from "../../../../shared/enums/Collection";
import { db } from "../../../../shared/utils/admin";
import { createPayee } from "../../../../shared/utils/moneyhubClient";
import BaseController from "../../../../shared/BaseController";
import { MerchantApprovalStatus } from "../../../../client/api/v1/controllers/MerchantsController";
import { HttpError, HttpStatusCode } from "../../../../shared/utils/errors";

export default class MerchantsController extends BaseController {
  review = async (req, res, next) => {
    try {
      const { merchantId } = req.params
      const { approvalStatus } = req.body

      const merchantDoc = await db()
        .collection(Collection.MERCHANT)
        .doc(merchantId)
        .get()

      if (!merchantDoc.exists) {
        const errorMessage = `Merchant with id ${merchantId} doesn't exist`
        next(new HttpError(HttpStatusCode.NOT_FOUND, errorMessage, errorMessage))
        return
      }

      const validApprovalStatuses = [
        MerchantApprovalStatus.APPROVED,
        MerchantApprovalStatus.DECLINED
      ]

      if (!validApprovalStatuses.includes(approvalStatus)) {
        const errorMessage = `Invalid approvalStatus ${approvalStatus}, must be in ${validApprovalStatuses}`
        next(new HttpError(HttpStatusCode.BAD_REQUEST, errorMessage, errorMessage))
        return
      }

      const { accountNumber, sortCode, companyName } = merchantDoc.data()

      const update = { approvalStatus }

      if (approvalStatus == MerchantApprovalStatus.APPROVED) {
        const payeeData = await createPayee(accountNumber, sortCode, companyName, merchantId)
        update["moneyhubPayeeId"] = payeeData.id
      }

      await db()
        .collection(Collection.MERCHANT)
        .doc(merchantId)
        .set(update, { merge: true })

      return res.status(200).json({ merchantId });
    } catch (err) {
      console.log(err)
      res.sendStatus(500)
    }
  }
}