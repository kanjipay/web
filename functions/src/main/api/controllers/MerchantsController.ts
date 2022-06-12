import BaseController from "../../../shared/BaseController";
import LoggingController from "../../../shared/utils/loggingClient";
import { v4 as uuid } from "uuid"
import { db } from "../../../shared/utils/admin";
import Collection from "../../../shared/enums/Collection";
import { firestore } from "firebase-admin";
import { createMembership, OrganisationRole } from "../../../shared/utils/membership";

export class MerchantsController extends BaseController {
  create = async (req, res, next) => {
    try {
      const userId = req.user.id;
      const loggingClient = new LoggingController("Merchant Controller");
      loggingClient.log(
        "Merchant creation started",
        {
          environment: process.env.ENVIRONMENT,
          clientURL: process.env.CLIENT_URL,
        },
        req.body
      );

      const { accountNumber, address, companyName, displayName, sortCode, description, currency, photo } = req.body;

      const merchantId = uuid();

      const createMerchant = db()
        .collection(Collection.MERCHANT)
        .doc(merchantId)
        .set({
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
        });

      await Promise.all([
        createMerchant,
        createMembership(userId, merchantId, displayName, OrganisationRole.ADMIN)
      ])

      loggingClient.log(
        "Merchant document creation complete",
        {},
        { merchantId }
      );
      return res.status(200).json({ merchantId });
    } catch (err) {
      next(err)
    }
  }
}