import Collection from "../../../shared/enums/Collection";
import BaseController from "../../../shared/BaseController";
import { addDocument } from "../../../shared/utils/addDocument";
import { firestore } from "firebase-admin";

export default class BanksController extends BaseController {
  index = async (req, res, next) => {
    try {

      return res.status(200).json({});
    } catch (err) {
      next(err)
    }
  }
}