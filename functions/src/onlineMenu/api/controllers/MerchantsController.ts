import BaseController from "../../../shared/BaseController";
import { db } from "../../../shared/utils/admin";
import Collection from "../../../shared/enums/Collection";
import LoggingController from "../../../shared/utils/loggingClient";

import { firestore } from "firebase-admin";
import { v4 as uuid } from "uuid";
import { PayeeApprovalStatus } from "../../../shared/enums/PayeeApprovalStatus";

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

      const { accountNumber, address, companyName, displayName, sortCode, description, imageAsFile } = req.body;

      const payeeId = uuid();
      const merchantId = uuid();
      const photoPath = `/${merchantId}/${imageAsFile.name}`;

      const createPayee = db()
        .collection(Collection.PAYEE)
        .doc(payeeId)
        .set({
          accountNumber,
          address,
          companyName,
          sortCode,
          createdAt: firestore.FieldValue.serverTimestamp(),
          approvalStatus: PayeeApprovalStatus.PENDING,
        });
      
      const createMerchant = db()
        .collection(Collection.MERCHANT)
        .doc(merchantId)
        .set({
          address,
          companyName,
          photo: photoPath,
          displayName,
          description,
          payeeId,
          createdAt: firestore.FieldValue.serverTimestamp(),
          approvalStatus: "PENDING"
        });

      const createMembership = db()
        .collection(Collection.MEMBERSHIP)
        .add({
          lastUsedAt: firestore.FieldValue.serverTimestamp(),
          merchantId,
          merchantName: displayName,
          role: "ADMIN",
          userId
        });

      await Promise.all([
        createPayee,
        createMerchant,
        createMembership
      ])
      /*
      const storageIntance = storage();
      storageIntance.bucket().file(photoPath).save(imageAsFile);
      */
      
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
