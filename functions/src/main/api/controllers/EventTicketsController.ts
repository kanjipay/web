import BaseController from "../../../shared/BaseController";
import Collection from "../../../shared/enums/Collection";
import { db } from "../../../shared/utils/admin";
import { logger } from "firebase-functions/v1";
import { fetchDocumentsInArray } from "../../../cron/deleteTicketsForIncompletePayments";
import { firestore } from "firebase-admin";

export class EventTicketsController extends BaseController {
  getAttendees = async (req, res, next) => {
    try {
      const { eventId} = req.params;
      logger.log(`getting ticketholders for event ${eventId}`);
      const ticketDocs = await db()
          .collection(Collection.TICKET)
          .where("eventId", "==", eventId)
          .get();
      const ticketUserIds = ticketDocs.docs.map((ticketDoc) => ticketDoc.data().userId);
      logger.log(ticketUserIds);
      const ticketUsers = await fetchDocumentsInArray(
        db().collection(Collection.USER),
        firestore.FieldPath.documentId(),
        ticketUserIds,
      )




      const ticketDetails = ticketDocs.docs.map(doc => {
        const ticketId = doc.id
        const { createdAt,
          eventEndsAt,
          merchantId,
          orderId,
          productId,
          userId,
          wasUsed } = doc.data();
        const ticketUser = ticketUsers.filter(user => user.id === userId)[0]
        const {email, firstName, lastName} = ticketUser
        return { 
          ticketId,
          createdAt,
          eventEndsAt,
          merchantId,
          orderId,
          productId,
          userId,
          wasUsed,
          ticketUser,
          email, 
          firstName, 
          lastName
         }
      })

        return res.status(200).json(
          ticketDetails
        );
    } catch (err) {
      logger.error(err)
      next(err);
    }
  }
}