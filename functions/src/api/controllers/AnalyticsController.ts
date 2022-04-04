
import BaseController from "./BaseController";
import { db } from "../../utils/admin";
import Collection from "../../enums/Collection";

export default class AnalyticsController extends BaseController {
    log = async (req, res, next) => {
            const data = req.body;
            console.log(data);

            await db()
            .collection(Collection.WEB_AUDIT_LOG)
            .add(
                data
            );
            
        
        return res.end();
    };
};