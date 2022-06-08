import BaseController from "../../../../shared/BaseController"
import Collection from "../../../../shared/enums/Collection";
import { db } from "../../../../shared/utils/admin";
import { HttpError, HttpStatusCode } from "../../../../shared/utils/errors";
import { fetchDocument } from "../../../../shared/utils/fetchDocument";
import LoggingController from "../../../../shared/utils/loggingClient";
import stripe from "../../../../shared/utils/stripeClient";

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

  createStripeAccountLink = async (req, res, next) => {
    try {
      const logger = new LoggingController("Create Stripe account")
      
      const { merchantId } = req.params

      logger.log("Creating Stripe account link", { merchantId })

      const { merchant, merchantError } = await fetchDocument(Collection.MERCHANT, merchantId)

      if (merchantError) {
        logger.log("Failed to retrieve merchant", { merchantError })
        next(merchantError)
        return
      }

      logger.log("Retrieved merchant", { merchant })

      if (merchant.stripe.areChargesEnabled) {
        logger.log("Merchant already has charges enabled for Stripe")

        const errorMessage = "You have already onboarded with Stripe."
        next(new HttpError(HttpStatusCode.BAD_REQUEST, errorMessage, errorMessage))
        return
      }

      let stripeAccountId: string

      if (merchant.stripe?.accountId) {
        stripeAccountId = merchant.stripe.accountId
      } else {
        logger.log("Merchant doesn't have an associated Stripe account, creating one")

        const account = await stripe.accounts.create({ type: "standard" })

        stripeAccountId = account.id

        const merchantUpdate = {
          stripe: {
            accountId: account.id,
            areChargesEnabled: false
          }
        }

        logger.log("Stripe account created, updating merchant", { account, merchantUpdate })

        await db()
          .collection(Collection.MERCHANT)
          .doc(merchantId)
          .update(merchantUpdate)
      }

      const baseUrl = `${process.env.CLIENT_URL}/dashboard/o/${merchantId}`

      const accountLinkCreateBody = {
        account: stripeAccountId,
        refresh_url: baseUrl,
        return_url: `${baseUrl}/stripe-connected`,
        type: "account_onboarding"
      }

      logger.log("Creating account link", { accountLinkCreateBody })

      const accountLink = await stripe.accountLinks.create(accountLinkCreateBody)

      logger.log("Account link created", { accountLink })

      const redirectUrl = accountLink.url

      return res.status(200).json({ redirectUrl })
    } catch (err) {
      next(err)
    }
  }

  updateStripeStatusIfNeeded = async (req, res, next) => {
    try {
      const logger = new LoggingController("Check Stripe status")

      const { merchantId } = req.params

      const { merchant, merchantError } = await fetchDocument(Collection.MERCHANT, merchantId)

      if (merchantError) {
        logger.log("Failed to retrieve merchant", { merchantError })
        next(merchantError)
        return
      }

      logger.log("Retrieved merchant", { merchant })

      if (!merchant.stripe) {
        logger.log("No account for merrchant, returning")
        return res.status(200).json({ areChargesEnabled: false })
      }

      if (merchant.stripe.areChargesEnabled) {
        logger.log("areChargesEnabled set to true on merchant, returning")
        return res.status(200).json({ areChargesEnabled: true })
      }

      const account = await stripe.accounts.retrieve(merchant.stripe.accountId)

      logger.log("Stripe account retrieved", { account })

      const { charges_enabled } = account

      if (charges_enabled) {
        logger.log("Charges are enabled, updating merchant")
        
        await db()
          .collection(Collection.MERCHANT)
          .doc(merchantId)
          .update({
            "stripe.areChargesEnabled": true
          })
      }

      return res.status(200).json({ areChargesEnabled: charges_enabled })
    } catch (err) {
      next(err)
    }
  }
}