import BaseController from "../../../shared/BaseController";
import { db } from "../../../shared/utils/admin";
import Collection from "../../../shared/enums/Collection";
import LoggingController from "../../../shared/utils/loggingClient";
import { firestore } from "firebase-admin";
import { v4 as uuid } from "uuid";
import { PayeeApprovalStatus } from "../../../shared/enums/PayeeApprovalStatus";
import { createMembership, OrganisationRole } from "../../utils/membership";

export default class MerchantsController extends BaseController {
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

      const payeeId = uuid();
      const merchantId = uuid();

      const createPayee = db()
        .collection(Collection.PAYEE)
        .doc(payeeId)
        .set({
          accountNumber,
          address,
          companyName,
          sortCode,
          currency,
          createdAt: firestore.FieldValue.serverTimestamp(),
          clientId: process.env.MERCADO_CLIENT_ID,
          approvalStatus: PayeeApprovalStatus.PENDING,
        });
      
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
          payeeId,
          sortCode,
          accountNumber,
          createdAt: firestore.FieldValue.serverTimestamp(),
          approvalStatus: "PENDING"
        }); 

      await Promise.all([
        createPayee,
        createMerchant,
        createMembership(userId, merchantId, displayName, OrganisationRole.ADMIN)
      ])
      
      loggingClient.log(
        "Merchant document creation complete",
        {},
        { merchantId, payeeId }
      );
      loggingClient.log("Merchant subcollection creation complete");
      return res.status(200).json({ merchantId });
    } catch (err) {
      console.log(err);
      res.sendStatus(500);
    }
  };
}
