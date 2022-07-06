import Collection from "../../../src/shared/enums/Collection";
import { OrderType } from "../../../src/shared/enums/OrderType";
import { db } from "../../utils/admin";

export async function cleanTicketPurchases(merchantId: string) {
  const fetchTicketsToDelete = db
    .collection(Collection.TICKET)
    .where("merchantId", "==", merchantId)
    .get();

  const fetchOrdersToDelete = db
    .collection(Collection.ORDER)
    .where("merchantId", "==", merchantId)
    .where("orderType", "==", OrderType.TICKETS)
    .get();

  const [ticketsToDelete, ordersToDelete] = await Promise.all([
    fetchTicketsToDelete,
    fetchOrdersToDelete,
  ])

  const batch = db.batch();

  for (const ticket of ticketsToDelete.docs) {
    batch.delete(db.collection(Collection.TICKET).doc(ticket.id));
  }

  for (const order of ordersToDelete.docs) {
    batch.delete(db.collection(Collection.ORDER).doc(order.id));
  }

  await batch.commit()
}
