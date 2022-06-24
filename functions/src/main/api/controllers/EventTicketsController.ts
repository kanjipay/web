import BaseController from "../../../shared/BaseController";
import Collection from "../../../shared/enums/Collection";
import { db } from "../../../shared/utils/admin";

export class EventTicketsController extends BaseController {
  get = async (req, res, next) => {
    try {
      const { eventId} = req.params;
      console.log(`getting ticketholders for event ${eventId}`);
      const ticketSnapshot = await db()
          .collection(Collection.TICKET)
          .where("eventId", "==", eventId)
          .get();
      
      const allTickets = ticketSnapshot.docs.map(doc => ({ id: doc.id, userId:doc.data().userId }));
      console.log(allTickets);
      let allTicketsWithUsers = [];
      for(const {id, userId} of allTickets) {
        const userRef= await db()
          .collection(Collection.USER)
          .doc(userId)
          .get()
        const {firstName, lastName, email} = userRef.data();
        allTicketsWithUsers.push({id, userId, firstName, lastName, email})
      }
        return res.status(200).json(
          allTicketsWithUsers
        );
    } catch (err) {
      console.log(err)
      next(err);
    }
  }
}