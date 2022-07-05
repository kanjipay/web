import { firestore } from "firebase-admin"
import BaseController from "../../../../shared/BaseController"
import Collection from "../../../../shared/enums/Collection"
import OrderStatus from "../../../../shared/enums/OrderStatus"
import { db } from "../../../../shared/utils/admin"
import { logger } from "firebase-functions/v1"
import { fetchDocumentsInArray } from "../../../../shared/utils/fetchDocumentsInArray"

export class MerchantEventAttendeesController extends BaseController {
  getEventAttendees = async (req, res, next) => {
    try {
      const { eventId } = req.params
      logger.log("getting ticketholders for event", { eventId })
      const orderDocs = await db()
        .collection(Collection.ORDER)
        .where("eventId", "==", eventId)
        .where("status", "==", OrderStatus.PAID)
        .get()

      logger.log("order docs", { orderDocs })

      const orderUserIds = [
        ...new Set(orderDocs.docs.map((orderDoc) => orderDoc.data().userId)),
      ]
      const orderProductIds = [
        ...new Set(
          orderDocs.docs.map(
            (orderDoc) => orderDoc.data().orderItems[0].productId
          )
        ),
      ]
      logger.log("order Userids", { orderUserIds })
      logger.log("Product ids", { orderProductIds })
      const orderUsers = await fetchDocumentsInArray(
        db().collection(Collection.USER),
        firestore.FieldPath.documentId(),
        orderUserIds
      )

      const orderProducts = await fetchDocumentsInArray(
        db().collection(Collection.PRODUCT),
        firestore.FieldPath.documentId(),
        orderProductIds
      )
      logger.log("ticket users", { orderUsers })
      logger.log("products", { orderProducts })
      const ticketDetails = orderDocs.docs.map((doc) => {
        const orderId = doc.id
        const { createdAt, merchantId, orderItems, total, userId } = doc.data()
        const { earliestEntryAt, lastestEntryAt, description } =
          orderProducts.find((product) => product.id === productId)
        const { email, firstName, lastName } = orderUsers.find(
          (user) => user.id === userId
        )
        const { eventEndsAt, productId, quantity } = orderItems[0]
        return {
          createdAt,
          eventEndsAt,
          merchantId,
          orderId,
          productId,
          userId,
          total,
          email,
          firstName,
          lastName,
          earliestEntryAt,
          lastestEntryAt,
          description,
          quantity,
        }
      })
      logger.log("ticket details", { ticketDetails })
      return res.status(200).json(ticketDetails)
    } catch (err) {
      logger.error(err)
      next(err)
    }
  }
}
