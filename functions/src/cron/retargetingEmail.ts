import { logger } from "firebase-functions/v1"
import Collection from "../shared/enums/Collection"
import { db } from "../shared/utils/admin"
import { nHoursAgo } from "../shared/utils/time"
import { fetchDocumentsInArray } from "../shared/utils/fetchDocumentsInArray"
import { firestore } from "firebase-admin"
import { TemplateName,sendEmail } from "../shared/utils/sendEmail"


async function findMarketingConsentUsers(userEmails){
    // get users who have given marketing consent, and not been contacted for 7 days.
    const uniqueUserIds = new Set(userEmails.map((doc) => doc.data().userId))
    const userQuery = db().collection(Collection.USER).where("marketingConsentStatus","==", "APPROVED")
    const marketingConsentUsers = await fetchDocumentsInArray(userQuery,  firestore.FieldPath.documentId(),[...uniqueUserIds])
    return marketingConsentUsers.filter((doc) => !(doc.lastMarketingEmailDate && doc.lastMarketingEmailDate > nHoursAgo(24*7)))
}

async function findRetargetEvents(){
    // get abandoned orderrs within 24-48 hours
    const abandonedOrderSnapshot = await db()
      .collection(Collection.ORDER)
      .where("publishScheduledAt", "<", nHoursAgo(24))
      .where("publishScheduledAt", ">", nHoursAgo(48))
      .where("status", "==", "ABANDONED")
      .get()
    logger.log("Got abandoned orders", {
      orderCount: abandonedOrderSnapshot.docs.length,
    })
    // filter out events that will finish in 6 hours time
    return abandonedOrderSnapshot.docs.filter((doc) => doc.data().orderItems[0].eventEndsAt < nHoursAgo(-6))
}

function prepareEmailData(userEmails, notRecentlyContacted){
    let emailsToSend = {}
    userEmails.forEach(event=>{
        const {userId, eventId, merchantId, orderItems} = event.data()
        const eventUrl = `${process.env.CLIENT_URL}/events/${merchantId}/${eventId}`
        const consentUser = notRecentlyContacted.find(doc => doc.id = userId)
        if (consentUser) {
            emailsToSend[userId] = {email: consentUser.email, eventUrl, eventTitle: orderItems[0].eventTitle}
        }
    })
    return emailsToSend
}

export const sendRetargetingEmails = async (context) => {
  try {
    logger.log("Find Orders for Retargeting Email")
    const retargetEvents = findRetargetEvents()
    logger.log("retarget events", retargetEvents)
    const notRecentlyContacted = await findMarketingConsentUsers(retargetEvents)
    logger.log("notRecentlyContacted", notRecentlyContacted)
    const emailsToSend = prepareEmailData(retargetEvents,notRecentlyContacted)
    logger.log("emailsToSend", emailsToSend)
    for (const userId in emailsToSend){
        logger.log(`emailing user ${userId}`)
        const {email, eventUrl, orderItems} = emailsToSend[userId]
        await db().collection(Collection.USER).doc(userId).update({lastMarketingEmailDate: new Date()})
        logger.log(`updated last email date for user ${userId}`)
        await sendEmail([email], TemplateName.RETARGET, {eventUrl, orderItems})
        logger.log(`emailed user ${userId}`)
    }
  } catch (err) {
    logger.error(err)
  }
}
