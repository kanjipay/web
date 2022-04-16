import BaseController from "./BaseController";
import { db } from "../../../../shared/utils/admin";
import Collection from "../../../../shared/enums/Collection";
import * as functions from "firebase-functions";

export default class AnalyticsController extends BaseController {
    log = async (req, res, next) => {
            const data = req.body;
            functions.logger.log('Parsing web audit log event');

            await db()
            .collection(Collection.WEB_AUDIT_LOG)
            .doc(data.deviceId)
            .collection('events')
            .add(
                data
            ).catch((err) => {
                functions.logger.log('Error logging web audit event', err, data)
            });
            
        
        return res.end();
    };
};
