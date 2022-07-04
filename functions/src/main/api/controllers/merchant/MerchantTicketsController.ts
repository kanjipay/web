import { firestore } from "firebase-admin"
import BaseController from "../../../../shared/BaseController"
import Collection from "../../../../shared/enums/Collection"
import OrderStatus from "../../../../shared/enums/OrderStatus"
import { db } from "../../../../shared/utils/admin"
import { HttpError, HttpStatusCode } from "../../../../shared/utils/errors"
import { fetchDocument } from "../../../../shared/utils/fetchDocument"
import { dateFromTimestamp } from "../../../../shared/utils/time"
import { logger } from "firebase-functions/v1";
import { fetchDocumentsInArray } from "../../../../shared/utils/fetchDocumentsInArray";

export class MerchantTicketsController extends BaseController {
  check = async (req, res, next) => {
    try {
      const { ticketId, merchantId } = req.params
      const { eventId: checkedEventId } = req.body
      logger.log(`Checking ticket with id ${ticketId}`, { ticketId, merchantId, checkedEventId })
      const { ticket, ticketError } = await fetchDocument(Collection.TICKET, ticketId)
      if (ticketError) {
        next(ticketError)
        return
      }

      logger.log("Retrieved ticket from db", { ticket })

      const { eventId, productId, userId, wasUsed, usedAt } = ticket

      if (!eventId || !productId || !userId) {
        const errorMessage = "This ticket is invalid ticket. The event, product or customer is missing."
        next(new HttpError(HttpStatusCode.INTERNAL_SERVER_ERROR, errorMessage, errorMessage))
        return
      }

      if (eventId !== checkedEventId || merchantId !== ticket.merchantId) {
        const [
          { event: ticketEvent, eventError: ticketEventError },
          { event: checkedEvent, eventError: checkedEventError }
        ] = await Promise.all([
          fetchDocument(Collection.EVENT, eventId),
          fetchDocument(Collection.EVENT, checkedEventId)
        ])

        let errorMessage: string

        if (!ticketEvent || ticketEventError) {
          errorMessage = "Couldn't find the event this ticket is for."
        } else if (!checkedEvent || checkedEventError) {
          errorMessage = "The event you're scanning for doesn't exist"
        } else {
          const { title: ticketEventTitle } = ticketEvent
          const { title: checkedEventTitle } = checkedEvent

          errorMessage = `This ticket is for ${ticketEventTitle} but you're checking tickets for ${checkedEventTitle}.`
        }

        next(new HttpError(HttpStatusCode.BAD_REQUEST, errorMessage, errorMessage))
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
        if (error) {
          next(error)
          return
        }
      }

      logger.log("Got product, event and user", { product, event, user })

      const { latestEntryAt, earliestEntryAt } = product

      const currentDate = new Date()

      const isTooEarly = earliestEntryAt && currentDate < dateFromTimestamp(earliestEntryAt)
      const isTooLate = latestEntryAt && currentDate > dateFromTimestamp(latestEntryAt)

      const { firstName, lastName } = user

      if (!wasUsed) {
        await db()
          .collection(Collection.TICKET)
          .doc(ticketId)
          .update({
            wasUsed: true,
            usedAt: firestore.FieldValue.serverTimestamp()
          })

        logger.log("Updated ticket")
      }

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
        },
        wasUsed,
        usedAt,
        isTooEarly,
        isTooLate,
        earliestEntryAt,
        latestEntryAt
      })
    } catch (err) {
      next(err)
    }
  }

  salesData = async (req, res, next) => {
    try {
      const { merchantId } = req.params

      const getOrders = db()
        .collection(Collection.ORDER)
        .where("merchantId", "==", merchantId)
        .where("status", "==", OrderStatus.PAID)
        .get()

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
        productSnapshot,
        ordersSnapshot
      ] = await Promise.all([
        getEvents,
        getProducts,
        getOrders
      ])

      const sales = ordersSnapshot.docs.flatMap(doc => {
        const order: any = { id: doc.id, ...doc.data() }

        const { eventId, attributionData, type, createdAt, currency } = order

        return order.orderItems.map(item => {
          const { productId, title: productTitle, eventTitle, quantity, price } = item
          return { 
            orderId: order.id,
            amount: price * quantity,
            quantity,
            productId,
            productTitle,
            eventId,
            eventTitle,
            type,
            createdAt,
            attributionData,
            currency
          }
        })
      })

      const events = eventSnapshot.docs.map(doc => {
        return { id: doc.id, ...doc.data() }
      })

      const products = productSnapshot.docs.map(doc => {
        return { id: doc.id, ...doc.data() }
      })

      res.status(200).json({ events, products, sales })
    } catch (err) {
      next(err)
    }
  }
  getEventAttendees = async (req, res, next) => {
    try {
      const {eventId} = req.params;
      logger.log("getting ticketholders for event" , {eventId});
      const ticketDocs = await db()
          .collection(Collection.TICKET)
          .where("eventId", "==", eventId)
          .get();
      
      
      const ticketUserIds = ticketDocs.docs.map((ticketDoc) => ticketDoc.data().userId);
      const ticketProductIds = ticketDocs.docs.map((ticketDoc) => ticketDoc.data().productId);
      logger.log("ticket Userids", {ticketUserIds})
      logger.log("Product ids", {ticketProductIds});
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
      logger.log("ticket users",{ticketUsers})
      logger.log("products",{ticketProducts})
      const ticketDetails = ticketDocs.docs.map(doc => {
        const ticketId = doc.id
        const { createdAt,
          eventEndsAt,
          merchantId,
          orderId,
          productId,
          userId,
          wasUsed } = doc.data();
        const ticketUser = ticketUsers.find(user => user.id === userId)
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
      logger.log('ticket details',{ticketDetails});
      const ticketDetailsWithProduct = ticketDetails.map(ticket => {
      const ticketProduct = ticketProducts.find(product => product.id === ticket.productId)
      const {earliestEntryAt, lastestEntryAt, description} = ticketProduct
      return {...ticket,
          earliestEntryAt, 
          lastestEntryAt, 
          description
         }
      })
      logger.log("ticket details with product",{ticketDetailsWithProduct});
        return res.status(200).json(
          ticketDetailsWithProduct
        );
    } catch (err) {
      logger.error(err)
      next(err);
    }
  }
}