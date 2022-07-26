import { firestore } from "firebase-admin"
import { logger } from "firebase-functions/v1"
import Collection from "../shared/enums/Collection"
import { db } from "../shared/utils/admin"

export const publishScheduledEvents = async (context) => {
  try {
    logger.log("Publishing scheduled events")

    const eventsSnapshot = await db()
      .collection(Collection.EVENT)
      .where("publishScheduledAt", "<", new Date())
      .where("isPublished", "==", false)
      .get()

    logger.log("Got events scheduled to be published, publishing them", {
      eventCount: eventsSnapshot.docs.length,
    })

    const batch = db().batch()

    for (const eventDoc of eventsSnapshot.docs) {
      const eventRef = db().collection(Collection.EVENT).doc(eventDoc.id)
      batch.update(eventRef, { 
        isPublished: true,
        publishedAt: firestore.FieldValue.serverTimestamp()
      })
    }

    await batch.commit()

    logger.log("Events published")
  } catch (err) {
    logger.error(err)
  }
}
