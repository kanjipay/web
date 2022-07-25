import { logger } from "firebase-functions/v1"
import { addInterval } from "../main/api/controllers/merchant/EventRecurrencesController"
import Collection from "../shared/enums/Collection"
import { db } from "../shared/utils/admin"
import { v4 as uuid } from "uuid"
import { firestore } from "firebase-admin"

export const createRecurringEvents = async (context) => {
  try {
    const eventRecurrencesSnapshot = await db()
      .collection(Collection.EVENT_RECURRENCE)
      .where("nextEventCreateDate", "<", new Date())
      .get()

    const eventRecurrences: any[] = eventRecurrencesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

    if (eventRecurrences.length === 0) { return }

    const batch = db().batch()

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
        nextEventStartDate,
        nextEventEndDate
      } = eventRecurrence

      // The first start date
      let iterStartDate = nextEventStartDate
      let iterEndDate = nextEventEndDate

      const batchId = uuid()

      // If the start date of an event is before this date, it should be published immediately
      const publishBeforeDate = addInterval(new Date(), eventPublishInterval.interval, eventPublishInterval.amount)

      // If the start date of an event is before this date, it should be created
      const createBeforeDate = addInterval(publishBeforeDate, eventCreateInterval.interval, eventCreateInterval.amount)

      while (iterStartDate < createBeforeDate) {
        const eventId = uuid()
        const eventRef = db().collection(Collection.EVENT).doc(eventId)

        const publishDate = addInterval(iterStartDate, eventPublishInterval.interval, -eventPublishInterval.amount)

        batch.create(eventRef, {
          merchantId,
          eventRecurrenceId,
          eventRecurrenceBatchId: batchId,
          title,
          description,
          photo: photo.file.name,
          address,
          startsAt: iterStartDate,
          endsAt: iterEndDate,
          maxTicketsPerPerson: parseInt(maxTicketsPerPerson, 10),
          isPublished: new Date() < publishDate,
          publishScheduledAt: publishDate,
          createdAt: firestore.FieldValue.serverTimestamp()
        })

        iterStartDate = addInterval(iterStartDate, interval.interval, interval.amount)
        iterEndDate = addInterval(iterEndDate, interval.interval, interval.amount)
      }
    }

    await batch.commit()
  } catch (err) {
    logger.error(err)
  }
}