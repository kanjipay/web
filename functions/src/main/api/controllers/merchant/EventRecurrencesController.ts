import { addDays, addMonths, addWeeks } from "date-fns"
import { logger } from "firebase-functions/v1"
import BaseController from "../../../../shared/BaseController"
import Collection from "../../../../shared/enums/Collection"
import { db } from "../../../../shared/utils/admin"
import { v4 as uuid } from "uuid"
import { firestore } from "firebase-admin"
import { dateFromTimestamp } from "../../../../shared/utils/time"
import { fetchDocumentsInArray } from "../../../../shared/utils/fetchDocumentsInArray"

export enum TimeInterval {
  DAY = "DAY",
  WEEK = "WEEK",
  MONTH = "MONTH"
}

export class EventRecurrencesController extends BaseController {
  create = async (req, res, next) => {
    try {
      const { eventRecurrenceId, data } = req.body

      const {
        merchantId,
        title,
        description,
        photo,
        address,
        startsAt,
        endsAt,
        maxTicketsPerPerson,
        interval,
        eventPublishInterval,
        eventCreateInterval
      } = data

      logger.log(`Starting to creating event recurrence`, { eventRecurrenceId, data })

      const batch = db().batch()

      // If the start date of an event is before this date, it should be published immediately
      const publishBeforeDate = addInterval(new Date(), eventPublishInterval.interval, eventPublishInterval.amount)

      // If the start date of an event is before this date, it should be created
      const createBeforeDate = addInterval(publishBeforeDate, eventCreateInterval.interval, eventCreateInterval.amount)

      logger.log("Calculated before dates", { publishBeforeDate, createBeforeDate})

      let iterStartDate = new Date(startsAt)
      let iterEndDate = new Date(endsAt)

      while (iterStartDate < createBeforeDate) {
        const eventId = uuid()
        const eventRef = db().collection(Collection.EVENT).doc(eventId)
        const publishDate = addInterval(iterStartDate, eventPublishInterval.interval, -eventPublishInterval.amount)
        const isPublished = iterStartDate < publishBeforeDate

        logger.log("Creating event", { eventId, publishDate, iterStartDate, iterEndDate, isPublished })

        batch.create(eventRef, {
          merchantId,
          eventRecurrenceId,
          title,
          description,
          photo,
          address,
          startsAt: iterStartDate,
          endsAt: iterEndDate,
          maxTicketsPerPerson: parseInt(maxTicketsPerPerson, 10),
          isPublished,
          publishScheduledAt: publishDate,
          createdAt: firestore.FieldValue.serverTimestamp()
        })

        iterStartDate = addInterval(iterStartDate, interval.interval, interval.amount)
        iterEndDate = addInterval(iterEndDate, interval.interval, interval.amount)
      }

      const eventRecurrenceRef = db()
        .collection(Collection.EVENT_RECURRENCE)
        .doc(eventRecurrenceId)

      const nextEventCreateDate = addInterval(
        addInterval(
          iterStartDate, 
          eventPublishInterval.interval, 
          -eventPublishInterval.amount
        ),
        eventCreateInterval.interval,
        -eventCreateInterval.amount
      )

      logger.log("Creating event recurrence", { nextEventCreateDate, iterStartDate, iterEndDate })

      batch.create(eventRecurrenceRef, {
        merchantId,
        title,
        description,
        photo,
        address,
        maxTicketsPerPerson,
        interval,
        eventPublishInterval,
        eventCreateInterval,
        createdAt: firestore.FieldValue.serverTimestamp(),
        nextEventCreateDate,
        lastEventStartDate: addInterval(iterStartDate, interval.interval, -interval.amount),
        lastEventEndDate: addInterval(iterEndDate, interval.interval, -interval.amount),
      })

      await batch.commit()

      return res.sendStatus(200)
    } catch (err) {
      next(err)
    }
  }

  createProduct = async (req, res, next) => {
    try {
      const { merchantId, eventRecurrenceId } = req.params
      const { 
        title,
        description,
        price,
        capacity,
        releaseDateInterval
      } = req.body

      // Get all events generated by recurrence id which are yet to happen and add this product
      const getEventsSnapshot = db()
        .collection(Collection.EVENT)
        .where("eventRecurrenceId", "==", eventRecurrenceId)
        .where("startsAt", ">", new Date())
        .get()

      const getExistingProductRecurrences = db()
        .collection(Collection.PRODUCT_RECURRENCE)
        .where("eventRecurrenceId", "==", eventRecurrenceId)
        .get()

      const [
        eventsSnapshot,
        productRecurrencesSnapshot
      ] = await Promise.all([
        getEventsSnapshot,
        getExistingProductRecurrences
      ])

      const currLargestSortOrder = Math.max(...productRecurrencesSnapshot.docs.map(pr => pr.data().sortOrder), 0)
      const sortOrder = currLargestSortOrder + 1

      const batch = db().batch()

      const productRecurrenceId = uuid()
      const productRecurrenceRef = db().collection(Collection.PRODUCT_RECURRENCE).doc(productRecurrenceId)

      batch.create(productRecurrenceRef, {
        title,
        merchantId,
        eventRecurrenceId,
        description,
        sortOrder,
        price,
        capacity,
        releaseDateInterval,
        createdAt: firestore.FieldValue.serverTimestamp(),
      })

      for (const eventDoc of eventsSnapshot.docs) {
        const eventId = eventDoc.id
        const { startsAt } = eventDoc.data()
        const productId = uuid()
        const productRef = db().collection(Collection.PRODUCT).doc(productId)

        const productData = {
          eventId,
          merchantId,
          productRecurrenceId,
          eventRecurrenceId,
          title,
          sortOrder,
          isAvailable: true,
          reservedCount: 0,
          soldCount: 0,
          description,
          price,
          capacity,
          createdAt: firestore.FieldValue.serverTimestamp()
        }

        if (releaseDateInterval) {
          productData["releasesAt"] = addInterval(
            dateFromTimestamp(startsAt), 
            releaseDateInterval.interval, 
            -releaseDateInterval.amount
          )
        }

        batch.create(productRef, productData)
      }

      await batch.commit()

      return res.sendStatus(200)
    } catch (err) {
      next(err)
    }
  }

  update = async (req, res, next) => {
    try {
      const { eventRecurrenceId } = req.params
      const { title, description, photo, maxTicketsPerPerson, address, tags } = req.body

      const batch = db().batch()

      const eventRecurrenceRef = db().collection(Collection.EVENT_RECURRENCE).doc(eventRecurrenceId)

      batch.update(eventRecurrenceRef, {
        title,
        description,
        photo,
        maxTicketsPerPerson,
        address,
        tags
      })

      const eventSnapshot = await db()
        .collection(Collection.EVENT)
        .where("eventRecurrenceId", "==", eventRecurrenceId)
        .where("startsAt", ">", new Date())
        .get()

      const events: any[] = eventSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

      for (const event of events) {
        const eventRef = db().collection(Collection.EVENT).doc(event.id)
        const update = {
          title,
          description,
          photo,
          maxTicketsPerPerson,
          tags
        }

        if (!event.isPublished) {
          update["address"] = address
        }

        batch.update(eventRef, update)
      }

      await batch.commit()

      return res.sendStatus(200)
    } catch (err) {
      next(err)
    }
  }

  updateProduct = async (req, res, next) => {
    try {
      const { productRecurrenceId, eventRecurrenceId } = req.params
      const {
        title,
        description,
        price,
        capacity,
        releaseDateInterval
      } = req.body

      const eventSnapshot = await db()
        .collection(Collection.EVENT)
        .where("eventRecurrenceId", "==", eventRecurrenceId)
        .where("startsAt", ">", new Date())
        .get()

      const events = eventSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      const eventIds = events.map(e => e.id)

      const productQuery = db()
        .collection(Collection.PRODUCT)
        .where("productRecurrenceId", "==", productRecurrenceId)

      const products = await fetchDocumentsInArray(productQuery, "eventId", eventIds)

      const batch = db().batch()

      const productRecurrenceRef = db().collection(Collection.PRODUCT_RECURRENCE).doc(productRecurrenceId)
      batch.update(productRecurrenceRef, {
        title,
        description,
        price,
        capacity,
        releaseDateInterval
      })

      for (const product of products) {
        const event: any = events.find(e => e.id === product.eventId)

        if (!event) { continue }

        const update = {
          title,
          description,
          capacity,
        }

        if (!event.isPublished) {
          update["price"] = price
          
        }

        if (product.releasesAt && dateFromTimestamp(product.releasesAt) > new Date) {
          update["releasesAt"] = addInterval(dateFromTimestamp(event.startsAt), releaseDateInterval.interval, -releaseDateInterval.amount)
        }

        const productRef = db().collection(Collection.PRODUCT).doc(product.id)
        batch.update(productRef, update)
      }

      await batch.commit()

      return res.sendStatus(200)
    } catch (err) {
      next(err)
    }
  }

  delete = async (req, res, next) => {
    try {
      const { eventRecurrenceId, merchantId } = req.params

      const getEventsSnapshot = db()
        .collection(Collection.EVENT)
        .where("eventRecurrenceId", "==", eventRecurrenceId)
        .where("isPublished", "==", false)
        .where("endsAt", ">", new Date())
        .get()

      const getProductRecurrenceSnapshot = db()
        .collection(Collection.PRODUCT_RECURRENCE)
        .where("eventRecurrenceId", "==", eventRecurrenceId)
        .get()

      const [
        eventsSnapshot,
        productRecurrenceSnapshot
      ] = await Promise.all([
        getEventsSnapshot,
        getProductRecurrenceSnapshot
      ])

      const eventIds = eventsSnapshot.docs.map(doc => doc.id)

      const productQuery = db()
        .collection(Collection.PRODUCT)
        .where("merchantId", "==", merchantId)

      const productsToDelete = await fetchDocumentsInArray(productQuery, "eventId", eventIds)

      const batch = db().batch()

      for (const eventId of eventIds) {
        const eventRef = db().collection(Collection.EVENT).doc(eventId)
        batch.delete(eventRef)
      }

      for (const product of productsToDelete) {
        const productRef = db().collection(Collection.PRODUCT).doc(product.id)
        batch.delete(productRef)
      }

      for (const productRecurrenceDoc of productRecurrenceSnapshot.docs) {
        const productRecurrenceRef = db().collection(Collection.PRODUCT_RECURRENCE).doc(productRecurrenceDoc.id)
        batch.delete(productRecurrenceRef)
      }

      const eventRecurrenceRef = db().collection(Collection.EVENT_RECURRENCE).doc(eventRecurrenceId)
      batch.delete(eventRecurrenceRef)

      await batch.commit()
      
      return res.sendStatus(200)
    } catch (err) {
      next(err)
    }
  }

  deleteProduct = async (req, res, next) => {
    try {
      const { productRecurrenceId, eventRecurrenceId } = req.params

      const eventSnapshot = await db()
        .collection(Collection.EVENT)
        .where("eventRecurrenceId", "==", eventRecurrenceId)
        .where("isPublished", "==", false)
        .where("startsAt", ">", new Date())
        .get()

      const eventIds = eventSnapshot.docs.map(doc => doc.id)

      const getProductQuery = db()
        .collection(Collection.PRODUCT)
        .where("productRecurrenceId", "==", productRecurrenceId)

      const productsToDelete = await fetchDocumentsInArray(getProductQuery, "eventId", eventIds)
      const batch = db().batch()

      for (const product of productsToDelete) {
        const productRef = db().collection(Collection.PRODUCT).doc(product.id)
        batch.delete(productRef)
      }

      const productRecurrenceRef = db().collection(Collection.PRODUCT_RECURRENCE).doc(productRecurrenceId)
      batch.delete(productRecurrenceRef)

      await batch.commit()

      return res.sendStatus(200)
    } catch (err) {
      next(err)
    }
  }
}

export function addInterval(date: Date, interval: TimeInterval, amount: number): Date {
  function getAddFunction(): (date: Date | number, amount: number) => Date {
    switch (interval) {
      case TimeInterval.DAY:
        return addDays
      case TimeInterval.WEEK:
        return addWeeks
      case TimeInterval.MONTH:
        return addMonths
    }
  }

  return getAddFunction()(date, amount)
}
