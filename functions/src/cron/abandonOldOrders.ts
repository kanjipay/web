import { logger } from "firebase-functions/v1";
import { addMinutes } from "date-fns";
import { firestore } from "firebase-admin";
import Collection from "../shared/enums/Collection";
import OrderStatus from "../shared/enums/OrderStatus";
import { OrderType } from "../shared/enums/OrderType";
import { db } from "../shared/utils/admin";

export const abandonOldOrders = async (context) => {
  try {
    logger.log("Fetching pending ticket orders");

    const tenMinutesAgo = addMinutes(new Date(), -10);

    const snapshot = await db()
      .collection(Collection.ORDER)
      .where("type", "==", OrderType.TICKETS)
      .where("wereTicketsCreated", "==", false)
      .where("status", "==", OrderStatus.PENDING)
      .where("createdAt", "<", tenMinutesAgo)
      .get();

    const orders: any[] = snapshot.docs.map((doc) => {
      return { id: doc.id, ...doc.data() };
    });

    logger.log("Got orders", { orderCount: orders.length });

    if (orders.length === 0) {
      return;
    }

    const batch = db().batch();

    for (const order of orders) {
      const { productId, quantity } = order.orderItems[0];

      const orderRef = db().collection(Collection.ORDER).doc(order.id);
      const productRef = db().collection(Collection.PRODUCT).doc(productId);
      batch.update(orderRef, { status: OrderStatus.ABANDONED });
      batch.update(productRef, {
        reservedCount: firestore.FieldValue.increment(-quantity),
      });
    }

    await batch.commit();
  } catch (err) {
    logger.log(err);
  }
};
