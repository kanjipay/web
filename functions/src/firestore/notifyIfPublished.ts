import { logger } from "firebase-functions/v1"
import Collection from "../shared/enums/Collection"
import { db } from "../shared/utils/admin"
import { sendgridClient } from "../shared/utils/sendgridClient"
import { sendEmail, TemplateName } from "../shared/utils/sendEmail"
import { dateFromTimestamp } from "../shared/utils/time"
import { subDays } from "date-fns"
import { firestore } from "firebase-admin"
import { fetchDocumentsInArray } from "../shared/utils/fetchDocumentsInArray"
import OrderStatus from "../shared/enums/OrderStatus"


const getConsentingUsers = async (merchantId: string) : Promise<Array<string>> => {
    const oldestDate = subDays(new Date(), 90)
    const ticketPurchasers = await db().collection(Collection.ORDER).where("merchantId","==", merchantId).where('createdAt', '>', oldestDate).where('status', '==', OrderStatus.PAID).get()
    const purchaserIds = new Set(ticketPurchasers.docs.map((doc) => doc.data().userId))
    const userQuery = db().collection(Collection.USER).where("marketingConsentStatus","==", "APPROVED")
    const marketingConsentUsers = await fetchDocumentsInArray(userQuery,  firestore.FieldPath.documentId(),[...purchaserIds])
    const consentUserEmails =  marketingConsentUsers.map((u) => u.email)
    logger.log(`ticketPurchasers ${ticketPurchasers} marketingConsentUsers ${marketingConsentUsers}
    consentUsers ${consentUserEmails}`)
    return consentUserEmails
}

export const notifyIfPublished = async (change, context) => {
   try {
    logger.log(`change ${change} context ${context}`)
    const publishedAfter = change.after.data().isPublished
    const publishedBefore = change.before.data() && change.before.data().isPublished
    if (publishedAfter && !publishedBefore){
        const {title, address, description, startsAt, merchantId} = change.after.data() 
        const eventId = change.after.id
        const eventDate = dateFromTimestamp(startsAt.seconds)
        const merchantDoc =  await db().collection(Collection.MERCHANT).doc(merchantId).get()
        const merchantName =  merchantDoc.data().displayName
        const consentUserEmails = await getConsentingUsers(merchantId)
        const eventData = {
            merchantName,
            eventName:title,
            address,
            startsAt:eventDate,
            description,
            ticketLink:`${process.env.CLIENT_URL}/events/${merchantId}/${eventId}`
        }
        logger.log(consentUserEmails)
        logger.log(eventData)
        const emailText =  `New event published \n env ${process.env.ENVIRONMENT} \n merchant ${merchantName} \n title ${title} \n description ${description} \n startsAt ${eventDate}`
        const emailParams = {
            to: "team@mercadopay.co",
            from: "team@mercadopay.co",
            text:emailText,
            subject: "New Event",
        }
        logger.log("email params", emailParams)
        await Promise.all([sendEmail(consentUserEmails, TemplateName.NEW_EVENT, eventData),sendgridClient().send(emailParams)])
    }
   } catch (err) {
    logger.error(err)
  }
}
