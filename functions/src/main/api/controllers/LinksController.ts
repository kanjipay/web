import { firestore } from "firebase-admin";
import BaseController from "../../../shared/BaseController";
import Collection from "../../../shared/enums/Collection";
import { addDocument } from "../../../shared/utils/addDocument";
import { db } from "../../../shared/utils/admin";
import { HttpError, HttpStatusCode } from "../../../shared/utils/errors";
import { fetchDocument } from "../../../shared/utils/fetchDocument";
import { dateFromTimestamp } from "../../../shared/utils/time";

export class LinksController extends BaseController {
  create = async (req, res, next) => {
    try {
      const { path, stateId } = req.body

      // Expires 30 mins from now
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

      const { linkId } = await addDocument(Collection.LINK, {
        expiresAt,
        path,
        stateId,
        wasUsed: false,
        createdAt: firestore.FieldValue.serverTimestamp()
      })

      return res.status(200).json({ linkId });
    } catch (err) {
      next(err)
    }
  }

  get = async (req, res, next) => {
    try {
      const { linkId } = req.params

      const { link, linkError } = await fetchDocument(Collection.LINK, linkId, {
        wasUsed: false,
      })

      if (linkError) {
        next(linkError)
        return
      }

      if (dateFromTimestamp(link.expiresAt) < new Date()) {
        const errorMessage = "That link has expired"
        next(new HttpError(HttpStatusCode.BAD_REQUEST, errorMessage, errorMessage))
        return
      }

      return res.status(200).json(link)
    } catch (err) {
      next(err)
    }
  }

  accept = async (req, res, next) => {
    try {
      const { linkId } = req.params

      await db()
        .collection(Collection.LINK)
        .doc(linkId)
        .update({
          wasUsed: true
        })

      return res.sendStatus(200)
    } catch (err) {
      next(err)
    }
  }
}