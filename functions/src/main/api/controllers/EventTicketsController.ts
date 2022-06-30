import BaseController from "../../../shared/BaseController";
import Collection from "../../../shared/enums/Collection";
import { db } from "../../../shared/utils/admin";
import { logger } from "firebase-functions/v1";
import { fetchDocumentsInArray } from "../../../cron/deleteTicketsForIncompletePayments";
import { firestore } from "firebase-admin";

export class EventTicketsController extends BaseController {
  getAttendees = async (req, res, next) => {
    try {
      const {eventId} = req.params;
      logger.log(`getting ticketholders for event ${eventId}`);
      const ticketDocs = await db()
          .collection(Collection.TICKET)
          .where("eventId", "==", eventId)
          .get();
      
      
      const ticketUserIds = ticketDocs.docs.map((ticketDoc) => ticketDoc.data().userId);
      const ticketProductIds = ticketDocs.docs.map((ticketDoc) => ticketDoc.data().productId);
      logger.log(`ticket Userids ${ticketUserIds} ProductIds ${ticketProductIds}`);
      const ticketUsers = await fetchDocumentsInArray(
        db().collection(Collection.USER),
        firestore.FieldPath.documentId(),
        ticketUserIds,
      )

      const ticketProducts = await fetchDocumentsInArray(
        db().collection(Collection.PRODUCT),
        firestore.FieldPath.documentId(),
        ticketProductIds,
      )
      logger.log(`ticket Users ${ticketUsers} Products ${ticketProducts}`)
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
          email, 
          firstName, 
          lastName
         }
      });
      logger.log(`ticket details ${ticketDetails}`);
      const ticketDetailsWithProduct = ticketDetails.map(ticket => {
      const ticketProduct = ticketProducts.filter(product => product.id === ticket.productId)[0]
      const {earliestEntryAt, lastestEntryAt, description} = ticketProduct
      return {...ticket,
          earliestEntryAt, 
          lastestEntryAt, 
          description
         }
      })
      logger.log(`ticket details with product ${ticketDetailsWithProduct}`);
        return res.status(200).json(
          ticketDetailsWithProduct
        );
    } catch (err) {
      logger.error(err)
      next(err);
    }
  }
}