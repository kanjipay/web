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
import { sendMerchantWelcome } from "../../../shared/utils/sendMerchantWelcome"

export class MerchantsController extends BaseController {
  create = async (req, res, next) => {
    try {
      const userId: string = req.user.id
      logger.log("Merchant creation started")

      const {
        accountNumber,
        companyName,
        displayName,
        sortCode,
        currency,
        organiserTermsVersion
      } = req.body

      const merchantSnapshot = await db()
        .collection(Collection.MERCHANT)
        .where("displayName", "==", displayName)
        .get()

      const merchantCount = merchantSnapshot.docs.length
      const displayNameEncoded = displayName.toLowerCase().replace(" ", "-").replace("/", "-").replaceAll(/[^a-z0-9-]/gi, "")
      const linkName = merchantCount > 0 ? `${displayNameEncoded}-${merchantCount}` : displayNameEncoded

      const merchantId = uuid()
      const merchantData = {
        companyName,
        displayName,
        linkName,
        currency,
        sortCode,
        accountNumber,
        customerFee: 0.1,
        mercadoFee: 0.03,
        createdAt: firestore.FieldValue.serverTimestamp(),
        approvalStatus: "PENDING",
        organiserTerms: {
          signedAt: firestore.FieldValue.serverTimestamp(),
          version: organiserTermsVersion
        }
      }
      
      logger.log("Creating merchant and membership", {
        merchantId,
        merchantData,
      })

      const createMerchant = db()
        .collection(Collection.MERCHANT)
        .doc(merchantId)
        .set(merchantData)

      const emailParams = {
        to: "team@mercadopay.co",
        from: "team@mercadopay.co",
        fromname: "Mercado Team",
        text: `Merchant registered with Mercado: \n name - ${displayName} \n id - ${merchantId} \n env ${process.env.ENVIRONMENT}`,
        subject: "New Merchant",
      }
      logger.log("email params", emailParams)

      const sendMerchantCreationEmail = sendgridClient().send(emailParams)

      const createUserMembership = createMembership(
        userId,
        merchantId,
        displayName,
        OrganisationRole.ADMIN
      )

      const sendMerchantWelcomePromise = sendMerchantWelcome(userId, displayName)

      try {
        const mercadoAdmins: string[] = JSON.parse(process.env.MERCADO_ADMINS) // always add Mercado devs to new organisations

        logger.log("adding memberships: ", mercadoAdmins)

        await Promise.all(mercadoAdmins.map(memberId => {
          createMembership(
            memberId,
            merchantId,
            displayName,
            OrganisationRole.ADMIN,
            false
          )
        }))
      } catch (err) {
        logger.error(err)
      }
      
      await Promise.all([
        createMerchant,
        createUserMembership,
        sendMerchantCreationEmail,
        sendMerchantWelcomePromise
      ])

      logger.log(`Successfully created merchant with id ${merchantId}`)
      
      return res.status(200).json({ merchantId })
    } catch (err) {
      logger.log(err)
      next(err)
    }
  }
}
