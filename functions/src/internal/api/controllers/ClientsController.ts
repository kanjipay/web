import Collection from "../../../shared/enums/Collection";
import BaseController from "../../../shared/BaseController";
import * as crypto from "crypto"
import { v4 as uuid } from "uuid"
import { db } from "../../../shared/utils/admin";
import { firestore } from "firebase-admin";
import { generateHash } from "../../../shared/utils/createHash";

export default class ClientsController extends BaseController {
  create = async (req, res, next) => {
    try {
      const { companyName } = req.body

      const clientId = uuid()
      const clientSecret = crypto.randomBytes(32).toString("hex")
      const clientSecretHash = generateHash(clientSecret)

      await db()
        .collection(Collection.CLIENT)
        .doc(clientId)
        .set({
          companyName,
          clientSecretHash,
          createdAt: firestore.FieldValue.serverTimestamp()
        })

      return res.status(200).json({ clientId, clientSecret });
    } catch (err) {
      res.sendStatus(500)
    }
  }
}