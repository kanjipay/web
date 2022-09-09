import { logger } from "firebase-functions/v1"
import Collection from "../shared/enums/Collection"
import { db } from "../shared/utils/admin"
import { sendgridClient } from "../shared/utils/sendgridClient"
import { sendEmail, TemplateName } from "../shared/utils/sendEmail"
import { subDays } from "date-fns"
import { firestore } from "firebase-admin"
import { fetchDocumentsInArray } from "../shared/utils/fetchDocumentsInArray"
import OrderStatus from "../shared/enums/OrderStatus"
import { createGooglePassEventClass, GoogleEventData } from "../shared/utils/googleWallet"
import * as moment from 'moment-timezone'

const getConsentingUsers = async (merchantId: string) : Promise<Array<string>> => {
    const oldestDate = subDays(new Date(), 90)
    const ticketPurchasers = await db().collection(Collection.ORDER).where("merchantId","==", merchantId).where('createdAt', '>', oldestDate).where('status', '==', OrderStatus.PAID).get()
    const purchaserIds = new Set(ticketPurchasers.docs.map((doc) => doc.data().userId))
    const userQuery = db().collection(Collection.USER).where("marketingConsentStatus","==", "APPROVED")
    const marketingConsentUsers = await fetchDocumentsInArray(userQuery,  firestore.FieldPath.documentId(),[...purchaserIds])
    const consentUserEmails =  marketingConsentUsers.map((u) => u.email)
    logger.log({ticketPurchasers,marketingConsentUsers,consentUserEmails})
    return consentUserEmails
}

export const notifyIfPublished = async (change, context) => {
   try {
    logger.log({change,context})
    const publishedAfter = change.after.data().isPublished
    const publishedBefore = change.before.data() && change.before.data().isPublished
    if (publishedAfter && !publishedBefore){
        const {title, address, description, startsAt, merchantId } = change.after.data() 
        const eventId = change.after.id
        const merchantDoc =  await db().collection(Collection.MERCHANT).doc(merchantId).get()
        const merchantName =  merchantDoc.data().displayName
        const consentUserEmails = await getConsentingUsers(merchantId)
        const startDate = moment(startsAt.toDate(), moment.ISO_8601).tz('Europe/London').format()
        const eventData = {
            merchantName,
            eventName:title,
            address,
            startsAt:startDate,
            description,
            ticketLink:`${process.env.CLIENT_URL}/events/${merchantId}/${eventId}`
        }
        const googleEventData: GoogleEventData = {
            eventId,
            merchantName,
            eventName:title,
            location: address,
            startDate,
            description,
        }
        logger.log({consentUserEmails, eventData})
        const emailText =  `New event published \n env ${process.env.ENVIRONMENT} \n merchant ${merchantName} \n title ${title} \n description ${description} \n startsAt ${startDate}`
        const emailParams = {
            to: "team@mercadopay.co",
            from: "team@mercadopay.co",
            text: emailText,
            subject: "New Event",
        }
        logger.log({emailParams})
        await Promise.all([
            sendEmail(consentUserEmails, TemplateName.NEW_EVENT, eventData),
            sendgridClient().send(emailParams),
            createGooglePassEventClass(googleEventData)
        ])
    }
   } catch (err) {
    logger.error(err)
  }
}
