import BaseController from "../../../../shared/BaseController";
import Collection from "../../../../shared/enums/Collection";
import { db } from "../../../../shared/utils/admin";
import { firestore } from "firebase-admin";
import { dateFromTimestamp, longFormat } from "../../../../shared/utils/time";
import { fetchDocument } from "../../../../shared/utils/fetchDocument";
import { HttpError, HttpStatusCode } from "../../../../shared/utils/errors";

export default class MerchantTicketsController extends BaseController {
  salesData = async (req, res, next) => {
    try {
      const { merchantId } = req.params

      const getEvents = db()
        .collection(Collection.EVENT)
        .where("merchantId", "==", merchantId)
        .where("isPublished", "==", true)
        .get()

      const getProducts = db()
        .collection(Collection.PRODUCT)
        .where("merchantId", "==", merchantId)
        .where("isPublished", "==", true)
        .get()

      const [
        eventSnapshot,
        productSnapshot
      ] = await Promise.all([
        getEvents,
        getProducts
      ])

      const events = eventSnapshot.docs.map(doc => {
        return { id: doc.id, ...doc.data() }
      })

      const products = productSnapshot.docs.map(doc => {
        return { id: doc.id, ...doc.data() }
      })

      res.status(200).json({ events, products })
    } catch (err) {
      next(err)
    }
  }

  check = async (req, res, next) => {
    try {
      const { ticketId, merchantId } = req.params
      const checkedEventId = req.body.eventId

      const { ticket, ticketError } = await fetchDocument(Collection.TICKET, ticketId)

      if (ticketError) {
        next(ticketError)
        return
      }

      const { eventId, productId, userId, wasUsed, usedAt } = ticket

      if (wasUsed) {
        let errorMessage = "This ticket was already used"

        if (usedAt) {
          errorMessage += ` ${longFormat(dateFromTimestamp(usedAt))}`
        }

        next(new HttpError(HttpStatusCode.BAD_REQUEST, errorMessage, errorMessage))
        return
      }

      if (!eventId || !productId || !userId) {
        const errorMessage = "This ticket is invalid ticket. The event, product or customer is missing."
        next(new HttpError(HttpStatusCode.INTERNAL_SERVER_ERROR, errorMessage, errorMessage))
        return
      }

      if (merchantId !== ticket.merchantId) {
        const errorMessage = "This ticket isn't for this organisation."
        next(new HttpError(HttpStatusCode.INTERNAL_SERVER_ERROR, errorMessage, errorMessage))
        return
      }

      if (eventId !== checkedEventId) {
        const errorMessage = "This ticket is for another event"
        next(new HttpError(HttpStatusCode.INTERNAL_SERVER_ERROR, errorMessage, errorMessage))
        return
      }

      const [
        { product, productError },
        { event, eventError },
        { user, userError },
      ] = await Promise.all([
        fetchDocument(Collection.PRODUCT, productId),
        fetchDocument(Collection.EVENT, eventId),
        fetchDocument(Collection.USER, userId)
      ])

      for (const error of [productError, eventError, userError]) {
        next(error)
        return
      }

      const { latestEntryAt, earliestEntryAt } = product

      const currentDate = new Date()

      if (currentDate > latestEntryAt || currentDate < earliestEntryAt) {
        const errorMessage = `This ticket is only valid from ${longFormat(dateFromTimestamp(earliestEntryAt))} to ${longFormat(dateFromTimestamp(latestEntryAt))}`
        next(new HttpError(HttpStatusCode.INTERNAL_SERVER_ERROR, errorMessage, errorMessage))
        return
      }

      if (product.eventId != checkedEventId) {
        const errorMessage = "This ticket is invalid. The product doesn't match the event."
        next(new HttpError(HttpStatusCode.INTERNAL_SERVER_ERROR, errorMessage, errorMessage))
        return
      }

      const { firstName, lastName } = user

      await db()
        .collection(Collection.TICKET)
        .doc(ticketId)
        .update({
          wasUsed: true,
          usedAt: firestore.FieldValue.serverTimestamp()
        })

      return res.status(200).json({
        product: {
          title: product.title
        },
        event: {
          title: event.title,
          photo: event.photo
        },
        user: {
          firstName,
          lastName
        }
      })
    } catch (err) {
      next(err)
    }
  }
}