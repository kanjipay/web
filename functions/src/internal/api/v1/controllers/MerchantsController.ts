import Collection from "../../../../shared/enums/Collection";
import { db } from "../../../../shared/utils/admin";
import { createPayee } from "../../../../shared/utils/moneyhubClient";
import BaseController from "../../../../shared/BaseController";
import { v4 as uuid } from "uuid";

export default class MerchantsController extends BaseController {
  create = async (req, res, next) => {
    const { 
      accountNumber, 
      sortCode, 
      companyName, 
      displayName, 
      address, 
      userId 
    } = req.body

    const merchantId = uuid()
    const payeeData = await createPayee(accountNumber, sortCode, companyName, merchantId)
    const moneyhubPayeeId = payeeData.id

    await db()
      .collection(Collection.MERCHANT)
      .doc(merchantId)
      .set({
        accountNumber,
        sortCode,
        companyName,
        displayName,
        address,
        userId,
        moneyhubPayeeId,
        status: "CLOSED"
      });

    return res.status(200).json({ merchantId });
  }
}