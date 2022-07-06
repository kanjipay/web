import { firestore } from "firebase-admin"
import BaseController from "../../../shared/BaseController"
import Collection from "../../../shared/enums/Collection"
import { addDocument } from "../../../shared/utils/addDocument"
import { db } from "../../../shared/utils/admin"
import { HttpError, HttpStatusCode } from "../../../shared/utils/errors"
import { fetchDocument } from "../../../shared/utils/fetchDocument"
import LoggingController from "../../../shared/utils/loggingClient"
import { dateFromTimestamp } from "../../../shared/utils/time"

export class LinksController extends BaseController {
  create = async (req, res, next) => {
    try {
      const { path, stateId } = req.body;

      const logger = new LoggingController("Create link");

      // Expires 30 mins from now
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000)
      const linkData = {
        expiresAt,
        path,
        stateId,
        wasUsed: false,
        createdAt: firestore.FieldValue.serverTimestamp(),
      }

      logger.log(
        `Creating one time link for path ${path} with state id ${stateId}`,
        { linkData }
      )

      const { linkId } = await addDocument(Collection.LINK, linkData);

      logger.log(`Created link with id ${linkId}`);

      return res.status(200).json({ linkId })
    } catch (err) {
      next(err);
    }
  };

  get = async (req, res, next) => {
    try {
      const { linkId } = req.params;

      const logger = new LoggingController("Get link");

      logger.log(`Retrieving link with id $`);

      const { link, linkError } = await fetchDocument(Collection.LINK, linkId, {
        wasUsed: false,
      });

      if (linkError) {
        next(linkError);
        return;
      }

      const expiresAt = dateFromTimestamp(link.expiresAt);

      if (expiresAt < new Date()) {
        const errorMessage = "That link has expired"
        logger.log(`Link expired at ${expiresAt.toDateString()}`)
        next(
          new HttpError(HttpStatusCode.BAD_REQUEST, errorMessage, errorMessage)
        )
        return
      }

      logger.log("Retrieved link successfully", { link });

      return res.status(200).json(link);
    } catch (err) {
      next(err);
    }
  };

  accept = async (req, res, next) => {
    try {
      const { linkId } = req.params;

      const logger = new LoggingController("Accept link");

      logger.log(`Accepting link with id ${linkId}`);

      await db().collection(Collection.LINK).doc(linkId).update({
        wasUsed: true,
      });

      logger.log(`Updated link as used`)

      return res.sendStatus(200);
    } catch (err) {
      next(err);
    }
  }
}
