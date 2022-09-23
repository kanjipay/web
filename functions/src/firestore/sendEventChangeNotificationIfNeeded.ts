import { format } from "date-fns"
import { firestore } from "firebase-admin"
import { logger } from "firebase-functions/v1"
import Collection from "../shared/enums/Collection"
import { db } from "../shared/utils/admin"
import { fetchDocumentsInArray } from "../shared/utils/fetchDocumentsInArray"
import { sendEmail, TemplateName } from "../shared/utils/sendEmail"
import { dateFromTimestamp } from "../shared/utils/time"

export const sendEventChangeNotificationIfNeeded = async (change, context) => {
  try {
    const eventId = change.before.id
    const before = change.before.data()
    const after = change.after.data()

    logger.log("Event change", { before, after, eventId })

    const { merchantId } = after

    if (
      !before || // Event newly created, don't need to do anything as hasn't been published yet
      !before.isPublished || // Event isn't published yet
      dateFromTimestamp(before.endsAt) < new Date() // Event in the past, no need to notify
    ) { 
      logger.log("Event not eligible for change notification")
      return
    } 

    const changeStrings = []

    const timestampToString = x => format(dateFromTimestamp(x), "do MMM H:mm")

    const fieldData = [
      { field: "address", label: "address", transform: x => x },
      { field: "startsAt", label: "start time", transform: timestampToString },
      { field: "endsAt", label: "end time", transform: timestampToString },
    ]

    for (const fieldDatum of fieldData) {
      const { field, label, transform } = fieldDatum
      const fromValue = transform(before[field])
      const toValue = transform(after[field])

      if (fromValue !== toValue) {
        const changeString = `The ${label} changed from ${fromValue} to ${toValue}`
        changeStrings.push(changeString)
      }
    }

    logger.log("Got change strings", { changeStrings, count: changeStrings.length })

    if (changeStrings.length > 0) {
      // Get tickets for this event
      const ticketSnapshot = await db()
        .collection(Collection.TICKET)
        .where("eventId", "==", eventId)
        .get()

      logger.log("got event tickets", { count: ticketSnapshot.docs.length})

      const duplicatedUserIds = ticketSnapshot.docs.map(doc => doc.data().userId)
      const userIds = [...new Set(duplicatedUserIds)]

      logger.log("Got user ids", { count: userIds.length })

      if (userIds.length === 0) { return }

      const usersQuery = db().collection(Collection.USER)

      const users = await fetchDocumentsInArray(usersQuery, firestore.FieldPath.documentId(), userIds)

      logger.log("Fetched users to email", { count: users.length })

      const emails = users.map(u => u.email)

      emails.push("team@mercadopay.co")

      const data = {
        eventTitle: before.title,
        changeStrings,
        eventLink: `${process.env.CLIENT_URL}/events/${merchantId}/${eventId}`
      }

      logger.log("Formulated email data", { data })

      await sendEmail(emails, TemplateName.EVENT_CHANGE, data)
    }
  } catch (err) {
    logger.error(err)
  }
}