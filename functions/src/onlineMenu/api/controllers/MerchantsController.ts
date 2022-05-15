import BaseController from "../../../shared/BaseController";
import { db } from "../../../shared/utils/admin";
import Collection from "../../../shared/enums/Collection";
import LoggingController from "../../../shared/utils/loggingClient";
import { firestore } from "firebase-admin";


export default class MerchantsController extends BaseController {
  create = async (req, res, next) => {
    const loggingClient = new LoggingController("Merchant Controller");
    loggingClient.log(
        "Merchant creation started",
        {
          environment: process.env.ENVIRONMENT,
          clientURL: process.env.CLIENT_URL,
        },
        req.body
      );

    const { accountNumber, address, companyName, displayName, sortCode } = req.body;
    const payeeId = await db()
      .collection(Collection.PAYEE)
      .add({
        accountNumber, address, companyName, sortCode,
        createdAt: firestore.FieldValue.serverTimestamp(),
        status:  "PENDING",
    });
    const merchantId = await db()
      .collection(Collection.MERCHANT)
      .add({
        accountNumber, companyName, displayName, sortCode, payeeId,
        createdAt: firestore.FieldValue.serverTimestamp(),
        status: "PENDING",

    });
    loggingClient.log("Merchant document creation complete", {}, { merchantId, payeeId });
    loggingClient.log("Merchant subcollection creation complete");
    return res.status(200).json({ merchantId });
  };
}
