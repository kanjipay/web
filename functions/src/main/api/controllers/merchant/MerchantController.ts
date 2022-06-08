import BaseController from "../../../../shared/BaseController"
import Collection from "../../../../shared/enums/Collection";
import { db } from "../../../../shared/utils/admin";

export class MerchantController extends BaseController {
  addCrezcoUserId = async (req, res, next) => {
    try {
      const { crezcoUserId } = req.body;
      const { merchantId } = req.params

      await db()
        .collection(Collection.MERCHANT)
        .doc(merchantId)
        .update({
          crezco: {
            userId: crezcoUserId
          }
        })

      return res.sendStatus(200)
    } catch (err) {
      next(err)
    }
  }
}