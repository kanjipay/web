import { addDays, addMonths, addWeeks } from "date-fns"
import { logger } from "firebase-functions/v1"
import BaseController from "../../../../shared/BaseController"
import Collection from "../../../../shared/enums/Collection"
import { db } from "../../../../shared/utils/admin"
import { v4 as uuid } from "uuid"
import { firestore } from "firebase-admin"

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

      logger.log(`Creating event recurrence`, { eventRecurrenceId, data })

      const batch = db().batch()

      // If the start date of an event is before this date, it should be published immediately
      const publishBeforeDate = addInterval(new Date(), eventPublishInterval.interval, eventPublishInterval.amount)

      // If the start date of an event is before this date, it should be created
      const createBeforeDate = addInterval(publishBeforeDate, eventCreateInterval.interval, eventCreateInterval.amount)

      let iterStartDate = startsAt
      let iterEndDate = endsAt

      while (iterStartDate < createBeforeDate) {
        console.log(iterStartDate)

        const eventId = uuid()
        const eventRef = db().collection(Collection.EVENT).doc(eventId)

        const publishDate = addInterval(iterStartDate, eventPublishInterval.interval, -eventPublishInterval.amount)

        batch.create(eventRef, {
          merchantId,
          eventRecurrenceId,
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
        nextEventStartDate: iterStartDate,
        nextEventEndDate: iterEndDate
      })

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
