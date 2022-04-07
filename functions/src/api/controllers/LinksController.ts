import Collection from "../../enums/Collection";
import { db } from "../../utils/admin";
import BaseController from "./BaseController";

export default class LinksController extends BaseController {
  create = async (req, res, next) => {
    const { path } = req.body

    // Expires 30 mins from now
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    const linkRef = await db()
      .collection(Collection.LINK)
      .add({
        expiresAt,
        path,
        wasUsed: false
      });

    const linkId = linkRef.id

    return res.status(200).json({ linkId });
  }
}