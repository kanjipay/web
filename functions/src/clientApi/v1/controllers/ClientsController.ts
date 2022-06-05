import Collection from "../../../shared/enums/Collection";
import BaseController from "../../../shared/BaseController";
import { v4 as uuid } from "uuid"
import { db } from "../../../shared/utils/admin";
import { firestore } from "firebase-admin";
import sha256 = require("sha256");

const generateRandomHex = size => [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');

export default class ClientsController extends BaseController {
  create = async (req, res, next) => {
    try {
      const { companyName } = req.body

      const clientId = uuid()
      const clientSecret = generateRandomHex(32)
      const clientSecretHash = sha256(clientSecret)

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