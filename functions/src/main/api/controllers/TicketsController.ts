import { firestore } from "firebase-admin"
import { fetchDocumentsInArray } from "../../../shared/utils/fetchDocumentsInArray"
import BaseController from "../../../shared/BaseController"
import Collection from "../../../shared/enums/Collection"
import { db } from "../../../shared/utils/admin"
import { dateFromTimestamp } from "../../../shared/utils/time"

export class TicketsController extends BaseController {
  index = async (req, res, next) => {
    try {
      const userId = req.user.id

      const ticketSnapshot = await db()
        .collection(Collection.TICKET)
        .where("userId", "==", userId)
        .limit(1000)
        .get()

      const tickets = ticketSnapshot.docs.map((doc) => {
        const { eventId, productId, createdAt, hash } = doc.data()
        return { id: doc.id, eventId, productId, createdAt, hash }
      })

      if (tickets.length === 0) {
        return res.status(200).json({ events: [] })
      }

      const eventIds = [...new Set(tickets.map((t) => t.eventId))]
      const productIds = [...new Set(tickets.map((t) => t.productId))]

      const eventDocs = await fetchDocumentsInArray(
        db().collection(Collection.EVENT),
        firestore.FieldPath.documentId(),
        eventIds
      )

      const productDocs = await fetchDocumentsInArray(
        db().collection(Collection.PRODUCT),
        firestore.FieldPath.documentId(),
        productIds
      )

      const products = productDocs
        .map((doc) => {
          const productId = doc.id
          const { title, description, price, eventId, sortOrder, purchaserInfo } = doc
          const productTickets = tickets
            .filter((ticket) => ticket.productId === productId)
            .sort((ticket1, ticket2) => {
              if (!ticket1.createdAt) { 
                if (!ticket2.createdAt) {
                  return 0
                } else {
                  return -1 
                }
              } else if (!ticket2.createdAt) { 
                return 1
              }
              return dateFromTimestamp(ticket2.createdAt).getTime() - dateFromTimestamp(ticket1.createdAt).getTime()
            })

          return {
            id: productId,
            title,
            description,
            purchaserInfo,
            price,
            eventId,
            sortOrder,
            tickets: productTickets,
          }
        })
        .sort((product1, product2) => {
          return product2.sortOrder - product1.sortOrder
        })

      const events = eventDocs
        .map((doc) => {
          const eventId = doc.id
          const {
            address,
            title,
            description,
            startsAt,
            endsAt,
            photo,
            merchantId,
          } = doc
          const eventProducts = products.filter(
            (product) => product.eventId === eventId
          )
          return {
            id: eventId,
            address,
            title,
            description,
            startsAt,
            endsAt,
            photo,
            merchantId,
            products: eventProducts,
          }
        })
        .sort((event1, event2) => {
          return dateFromTimestamp(event1.startsAt) >
            dateFromTimestamp(event2.startsAt)
            ? -1
            : 1
        })

      return res.status(200).json({ events })
    } catch (err) {
      next(err)
    }
  }
}
