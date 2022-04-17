import BaseController from "../../../../shared/BaseController";
import Collection from "../../../../shared/enums/Collection";
import MerchantStatus from "../../../../shared/enums/MerchantStatus";
import { db } from "../../../../shared/utils/admin";

export enum MerchantApprovalStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  DECLINED = "DECLINED"
}

export default class MerchantsController extends BaseController {
  create = async (req, res, next) => {
    try {
      const clientId = "abc" // This will soon be sent in the headers

      const {
        displayName,
        companyName,
        sortCode,
        accountNumber,
        address
      } = req.body

      const merchantDoc = await db()
        .collection(Collection.MERCHANT)
        .add({
          displayName,
          companyName,
          sortCode,
          accountNumber,
          address,
          clientId,
          approvalStatus: MerchantApprovalStatus.PENDING,
          status: MerchantStatus.CLOSED
        })

      const merchantId = merchantDoc.id

      res.status(200).json({
        merchantId
      })
    } catch (err) {
      console.log(err)
      res.sendStatus(500)
    }
    
  }

  show = async (req, res, next) => {
    try {
      const clientId = "abc"
      const { merchantId } = req.params

      const merchantDoc = await db()
        .collection(Collection.MERCHANT)
        .doc(merchantId)
        .get()

      if (!merchantDoc.exists) {
        return res.sendStatus(404)
      }

      const merchant: any = { id: merchantDoc.id, ...merchantDoc.data() }

      if (merchant.clientId !== clientId) {
        return res.sendStatus(403)
      }

      res.status(200).json(merchant)
    } catch (err) {
      console.log(err)
      res.sendStatus(500)
    }
  }

  index = async (req, res, next) => {
    try {
      const clientId = "abc"

      const snapshot = await db()
        .collection(Collection.MERCHANT)
        .where(`clientId`, "==", clientId)
        .limit(1)
        .get();

      const merchants = snapshot.docs.map(doc => {
        return { id: doc.id, ...doc.data() }
      })

      res.status(200).json(merchants)
    } catch (err) {
      console.log(err)
      res.sendStatus(500)
    }
  }


}