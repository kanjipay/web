import Collection from "../../../shared/enums/Collection";
// import { db } from "../../../shared/utils/admin";
import BaseController from "../../../shared/BaseController";
import { fetchDocument } from "../../../shared/utils/fetchDocument";

export default class RefundsController extends BaseController {
  createRefundAttempt = async (req, res, next) => {
    const { chargeId } = req.body
    const { chargeError } = await fetchDocument(Collection.CHARGE, chargeId, { isReversible: true })

    if (chargeError) {
      next(chargeError)
      return
    }

    // const refundDoc = await db()
    //   .collection(Collection.REFUND_ATTEMPT)
    //   .add({
    //     chargeId
    //   })

    res.status(200).json({
      url: `${process.env.CLIENT_URL}/charges/${chargeId}/refund`,
    })

  }
}