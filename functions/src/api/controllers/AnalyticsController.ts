import BaseController from "./BaseController";
import { db } from "../../utils/admin";
import Collection from "../../enums/Collection";

export default class AnalyticsController extends BaseController {
  log = async (req, res, next) => {
    const data = req.body;

    await db()
      .collection(Collection.WEB_AUDIT_LOG)
      .doc(data.deviceId)
      .collection("events")
      .add(data);

    return res.end();
  };
}
