import { NextFunction } from "express";
import { firestore } from "firebase-admin";
import BaseController from "../../../shared/BaseController";
import Collection from "../../../shared/enums/Collection";
import { addDocument } from "../../../shared/utils/addDocument";
import { db } from "../../../shared/utils/admin";
import { fetchDocument } from "../../../shared/utils/fetchDocument";
import { PayeeApprovalStatus } from "../../../shared/enums/PayeeApprovalStatus";

const returnedPayeeFields = [
  "companyName",
  "companyNumber",
  "sortCode",
  "accountNumber",
  "address",
  "approvalStatus"
]

function filterObjectKeys(obj: any, keys: string[]) {
  return Object.keys(obj).reduce((currObj, key) => {
    currObj[key] = obj[key]
    return currObj
  }, {})
}

export default class PayeesController extends BaseController {
  create = async (req, res, next) => {
    try {
      const { clientId } = req

      const {
        companyName,
        companyNumber,
        sortCode,
        accountNumber,
        address
      } = req.body

      const { payeeId } = await addDocument(Collection.PAYEE, {
        companyName,
        companyNumber,
        sortCode,
        accountNumber,
        address,
        clientId,
        approvalStatus: PayeeApprovalStatus.PENDING,
        createdAt: firestore.FieldValue.serverTimestamp()
      })

      res.status(200).json({ payeeId })
    } catch (err) {
      console.log(err)
      res.sendStatus(500)
    }
  }

  show = async (req, res, next: NextFunction) => {
    try {
      const { clientId } = req
      const { payeeId } = req.params
      const { payee, payeeError } = await fetchDocument(Collection.PAYEE, payeeId, { clientId })

      if (payeeError) {
        next(payeeError)
        return
      }

      const publicPayee = filterObjectKeys(payee, returnedPayeeFields)

      res.status(200).json(publicPayee)
    } catch (err) {
      console.log(err)
      res.sendStatus(500)
    }
  }

  index = async (req, res, next) => {
    try {
      const { clientId } = req
      const limitFromQuery = req.query.limit ?? "10"
      const limit = parseInt(limitFromQuery, 10)

      const snapshot = await db()
        .collection(Collection.PAYEE)
        .where(`clientId`, "==", clientId)
        .limit(limit)
        .get();

      const payees = snapshot.docs.map(doc => {
        const payee = { id: doc.id, ...doc.data() }
        return filterObjectKeys(payee, returnedPayeeFields)
      })

      res.status(200).json(payees)
    } catch (err) {
      console.log(err)
      res.sendStatus(500)
    }
  }


}