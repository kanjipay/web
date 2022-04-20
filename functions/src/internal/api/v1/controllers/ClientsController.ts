import Collection from "../../../../shared/enums/Collection";
import { db } from "../../../../shared/utils/admin";
import BaseController from "./BaseController";
import { v4 as uuidv4 } from 'uuid';
import {createHash} from 'crypto';


export default class ClientsController extends BaseController {
  create = async (req, res, next) => {
    // todo align with json-schema updates
    const { clientName, bankAccount, sortCode, webhookUrl } = req.body

    const createdAt = new Date(Date.now());
    const clientId = uuidv4(); 
    const clientSecret = uuidv4(); 
    const clientSecretHash = createHash('md5').update(clientSecret).digest('hex');uuidv4(); 

    const linkRef = await db()
      .collection(Collection.CLIENT)
      .add({
        clientName, bankAccount, sortCode, webhookUrl, createdAt,
        clientId, clientSecretHash
      });
    return res.status(200).json({ clientId, clientSecret, createdAt });
  }
}