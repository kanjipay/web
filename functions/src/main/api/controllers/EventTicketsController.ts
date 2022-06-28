import BaseController from "../../../shared/BaseController";
import Collection from "../../../shared/enums/Collection";
import { db } from "../../../shared/utils/admin";
import { logger } from "firebase-functions/v1";
import { documentBatchFind} from '../../../shared/utils/documentBatchFind'


export class EventTicketsController extends BaseController {
  get = async (req, res, next) => {
    try {
      const { eventId} = req.params;
      logger.log(`getting ticketholders for event ${eventId}`);
      const ticketSnapshot = await db()
          .collection(Collection.TICKET)
          .where("eventId", "==", eventId)
          .get();
      
      const allTickets = ticketSnapshot.docs.map(doc => ({ id: doc.id, userId:doc.data().userId }));
      const allTicketUserIds = allTickets.map((ticket) => ticket.userId);
      logger.log(allTickets);
      const allUsers = await documentBatchFind(allTicketUserIds, Collection.USER);
      let combinedInfo = [];
      for i in 

        return res.status(200).json(
          allTicketsWithUsers
        );
    } catch (err) {
      logger.error(err)
      next(err);
    }
  }
}