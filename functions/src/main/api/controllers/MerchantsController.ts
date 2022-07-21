import BaseController from "../../../shared/BaseController"
import { v4 as uuid } from "uuid"
import { db } from "../../../shared/utils/admin"
import Collection from "../../../shared/enums/Collection"
import { firestore } from "firebase-admin"
import {
  createMembership,
  OrganisationRole,
} from "../../../shared/utils/membership"
import { logger } from "firebase-functions/v1"
import { sendgridClient } from "../../../shared/utils/sendgridClient"

export class MerchantsController extends BaseController {
  create = async (req, res, next) => {
    try {
      const userId = req.user.id
      logger.log("Merchant creation started")

      const {
        accountNumber,
        address,
        companyName,
        displayName,
        sortCode,
        description,
        currency,
        photo,
      } = req.body

      const merchantId = uuid()
      const merchantData = {
        address,
        companyName,
        photo,
        displayName,
        description,
        currency,
        sortCode,
        accountNumber,
        customerFee: 0.1,
        createdAt: firestore.FieldValue.serverTimestamp(),
        approvalStatus: "PENDING",
      }
      logger.log("Creating merchant and membership", {
        merchantId,
        merchantData,
      })

      const createMerchant = db()
        .collection(Collection.MERCHANT)
        .doc(merchantId)
        .set(merchantData)

      await Promise.all([
        createMerchant,
        createMembership(
          userId,
          merchantId,
          displayName,
          OrganisationRole.ADMIN
        ),
      ])

      logger.log(`Successfully created merchant with id ${merchantId}`)
      const updateText = `Merchant registered with Mercado: \n name - ${displayName} \n id - ${merchantId}`
      logger.log(updateText)
      sendgridClient()
        .send({
          to: "team@mercadopay.co",
          from: "team@mercadopay.co",
          text: updateText,
          subject: "New Merchant",
        })
        .then(() => logger.log("Mail sent successfully"))
        .catch((error) => {
          throw new Error(error)
        })

      return res.status(200).json({ merchantId })
    } catch (err) {
      logger.log(err)
      next(err)
    }
  }
}
