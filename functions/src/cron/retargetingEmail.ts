import { logger } from "firebase-functions/v1"
import Collection from "../shared/enums/Collection"
import { db } from "../shared/utils/admin"
import { dateFromTimestamp } from "../shared/utils/time"
import { subDays, addHours } from "date-fns"
import { fetchDocumentsInArray } from "../shared/utils/fetchDocumentsInArray"
import { firestore } from "firebase-admin"
import { TemplateName } from "../shared/utils/sendEmail"
import { sendgridClient } from "../shared/utils/sendgridClient"
import {OrderType} from "../shared/enums/OrderType"

async function findMarketingConsentUsers(orderDocs){
    // get users who have given marketing consent, and not been contacted for 7 days.
    logger.log(orderDocs.map((doc) => doc.data().userId))
    const uniqueUserIds = new Set(orderDocs.map((doc) => doc.data().userId))
    const userQuery = db().collection(Collection.USER).where("marketingConsentStatus","==", "APPROVED")
    logger.log('uniqueUserIds',uniqueUserIds)
    const marketingConsentUsers = await fetchDocumentsInArray(userQuery,  firestore.FieldPath.documentId(),[...uniqueUserIds])
    return marketingConsentUsers.filter((doc) => !(doc.lastMarketingEmailDate && dateFromTimestamp(doc.lastMarketingEmailDate) > subDays(new Date(),7))) // annoying not working
}

async function findRetargetEvents(){
    // get abandoned orderrs within 24-48 hours
    const abandonedOrderSnapshot = await db()
      .collection(Collection.ORDER)
      .where("createdAt", "<", subDays(new Date(), 1))
      .where("createdAt", ">", subDays(new Date(), 2))
      .where("type", "==", OrderType.TICKETS)
      .where("status", "==", "ABANDONED")
      .get()
    logger.log("Got abandoned orders", {
      orderCount: abandonedOrderSnapshot.docs.length,
    })
    // filter out events that will finish in 6 hours time
    return abandonedOrderSnapshot.docs.filter((doc) => dateFromTimestamp(doc.data().orderItems[0].eventEndsAt) > addHours(new Date(),6))
}

async function findRecentPurchasers(){
    // get paid orderrs within 48 hours
    const paidOrderSnapshot = await db()
      .collection(Collection.ORDER)
      .where("createdAt", ">", subDays(new Date(), 2))
      .where("status", "==", "PAID")
      .get()
    logger.log("Got paid orders", {
      orderCount: paidOrderSnapshot.docs.length,
    })
    return new Set(paidOrderSnapshot.docs.map((doc) => doc.data().userId))
}


function prepareEmailData(userEmails, notRecentlyContacted, recentPurchasers){
    let messageArray = []
    let userIds = []
    const templateIds = JSON.parse(process.env.TEMPLATE_IDS)
    const templateId = templateIds[TemplateName.RETARGET]  
    userEmails.forEach(event=>{
        const {userId, eventId, merchantId, orderItems} = event.data()
        const eventUrl = `${process.env.CLIENT_URL}/events/${merchantId}/${eventId}`
        const consentUser = notRecentlyContacted.find(doc => doc.id = userId)
        if (consentUser && !recentPurchasers.has(userId) && !userIds.includes(userId)) {
            const message = {
                        to: consentUser.email,
                        from:  'team@mercadopay.co',
                        dynamic_template_data: {eventUrl, eventTitle: orderItems[0].eventTitle},
                        template_id: templateId,
            }
            messageArray.push(message)
            userIds.push(userId)
        }
            
    })
    return {messageArray, userIds}
}

export const retargetOrders = async (context) => {
  try {
    logger.log("Find Orders for Retargeting Email")
    const retargetEvents = await findRetargetEvents()
    logger.log("retarget events", retargetEvents)
    const marketingConsentUsers = await findMarketingConsentUsers(retargetEvents)
    logger.log("marketingConsentUsers", marketingConsentUsers)
    const recentPurchasers = await findRecentPurchasers()
    const {messageArray, userIds} = prepareEmailData(retargetEvents, marketingConsentUsers, recentPurchasers)
    logger.log("messageArray", messageArray)
    logger.log("userIds", userIds)
    const currentDate = firestore.FieldValue.serverTimestamp()
    const batch = db().batch()
    userIds.forEach((userId) => {
        batch.update(db().collection(Collection.USER).doc(userId),{lastMarketingEmailDate: currentDate})
    })
    batch.commit()
    sendgridClient().send(messageArray)
 
  } catch (err) {
    logger.error(err)
  }
}
