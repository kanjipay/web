import { logger } from "firebase-functions/v1"
import { addInterval } from "../main/api/controllers/merchant/EventRecurrencesController"
import Collection from "../shared/enums/Collection"
import { db } from "../shared/utils/admin"
import { v4 as uuid } from "uuid"
import { firestore } from "firebase-admin"
import { fetchDocumentsInArray } from "../shared/utils/fetchDocumentsInArray"
import { dateFromTimestamp } from "../shared/utils/time"

export const createRecurringEvents = async (context) => {
  try {
    const eventRecurrencesSnapshot = await db()
      .collection(Collection.EVENT_RECURRENCE)
      .where("nextEventCreateDate", "<", new Date())
      .get()

    const eventRecurrences: any[] = eventRecurrencesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

    const productRecurrenceQuery = db().collection(Collection.PRODUCT_RECURRENCE)
    const allProductRecurrences = await fetchDocumentsInArray(
      productRecurrenceQuery, 
      "eventRecurrenceId",
      eventRecurrences.map(er => er.id)
    )

    const batch = db().batch()
    const batchId = uuid()

    for (const eventRecurrence of eventRecurrences) {
      const {
        id: eventRecurrenceId,
        merchantId,
        title,
        description,
        photo,
        address,
        maxTicketsPerPerson,
        interval,
        eventPublishInterval,
        eventCreateInterval,
        lastEventStartDate,
        lastEventEndDate
      } = eventRecurrence

      const productRecurrences = allProductRecurrences.filter(pr => pr.eventRecurrenceId === eventRecurrence.id)

      // The first start date
      let iterStartDate = addInterval(lastEventStartDate, interval.interval, interval.amount) 
      let iterEndDate = addInterval(lastEventEndDate, interval.interval, interval.amount)

      // If the start date of an event is before this date, it should be published immediately
      const publishBeforeDate = addInterval(new Date(), eventPublishInterval.interval, eventPublishInterval.amount)

      // If the start date of an event is before this date, it should be created
      const createBeforeDate = addInterval(publishBeforeDate, eventCreateInterval.interval, eventCreateInterval.amount)

      while (iterStartDate < createBeforeDate) {
        const eventId = uuid()
        const eventRef = db().collection(Collection.EVENT).doc(eventId)

        const startsAt = iterStartDate

        const publishDate = addInterval(iterStartDate, eventPublishInterval.interval, -eventPublishInterval.amount)

        batch.create(eventRef, {
          merchantId,
          eventRecurrenceId,
          eventRecurrenceBatchId: batchId,
          title,
          description,
          photo: photo.file.name,
          address,
          startsAt,
          endsAt: iterEndDate,
          maxTicketsPerPerson: parseInt(maxTicketsPerPerson, 10),
          isPublished: new Date() < publishDate,
          publishScheduledAt: publishDate,
          createdAt: firestore.FieldValue.serverTimestamp()
        })

        for (const productRecurrence of productRecurrences) {
          const {
            title,
            description,
            price,
            capacity,
            sortOrder,
            id: productRecurrenceId,
            releaseDateInterval
          } = productRecurrence

          const productId = uuid()
          const productRef = db().collection(Collection.PRODUCT).doc(productId)

          const productData = {
            eventId,
            merchantId,
            productRecurrenceId,
            eventRecurrenceId,
            title,
            description,
            price,
            capacity,
            sortOrder,
            isAvailable: true,
            soldCount: 0,
            reservedCount: 0,
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

        iterStartDate = addInterval(iterStartDate, interval.interval, interval.amount)
        iterEndDate = addInterval(iterEndDate, interval.interval, interval.amount)
      }
    }

    await batch.commit()
  } catch (err) {
    logger.error(err)
  }
}