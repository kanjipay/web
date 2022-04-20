import Collection from "../../../shared/enums/Collection";
import BaseController from "../../../shared/BaseController";
import { addDocument } from "../../../shared/utils/addDocument";

export default class LinksController extends BaseController {
  create = async (req, res, next) => {
    const { path, stateId } = req.body

    // Expires 30 mins from now
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    const { linkId } = await addDocument(Collection.LINK, {
      expiresAt,
      path,
      stateId,
      wasUsed: false
    })

    return res.status(200).json({ linkId });
  }
}