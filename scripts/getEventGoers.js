const db = require("../db");

function getEventGoers(eventId){
    const ticketSnapshot = await db()
          .collection(Collection.TICKET)
          .where("eventId", "==", eventId)
          .get();
      const allTickets = ticketSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      const userIds = ticketSnapshot.docs.map(doc => doc.data().userId);
      const usersSnapshot = await db()
          .collection(Collection.USER)
          .where(firestore.FieldPath.documentId(), "in", userIds)
          .get();
  
      const allUsers = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      return {
        allUsers, allTickets
      };
}

console.log(getEventGoers("Kf8I9Y0BewF5PsAKCRvL"))
