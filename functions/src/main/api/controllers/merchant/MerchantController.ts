import BaseController from "../../../../shared/BaseController"
import Collection from "../../../../shared/enums/Collection"
import { db } from "../../../../shared/utils/admin"
import LoggingController from "../../../../shared/utils/loggingClient"
import { sendgridClient } from "../../../../shared/utils/sendgridClient"
import { firestore } from "firebase-admin"

export class MerchantController extends BaseController {
  addCrezcoUserId = async (req, res, next) => {
    try {
      const { crezcoUserId } = req.body
      const { merchantId } = req.params

      const logger = new LoggingController("Add Crezco user id")

      await db()
        .collection(Collection.MERCHANT)
        .doc(merchantId)
        .update({
          crezco: {
            userId: crezcoUserId,
            connnectedAt: firestore.FieldValue.serverTimestamp()
          },
        })

      const emailParams = {
        to: "team@mercadopay.co",
        from: "team@mercadopay.co",
        text: `Merchant with id ${merchantId} registered with Crezco`,
        subject: "Merchant linked to Crezco",
      }
      logger.log("email params", emailParams)
      await sendgridClient().send(emailParams)
      logger.log("email sent successfully")
      res.sendStatus(200)
    } catch (err) {
      next(err)
    }
  }
}
