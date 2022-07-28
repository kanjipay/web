import { logger } from "firebase-functions/v1"
import { sendEmail } from "../shared/utils/sendEmail"
import { fetchDocumentsInArray } from "../shared/utils/fetchDocumentsInArray"
import Collection from "../shared/enums/Collection"
import { db } from "../shared/utils/admin"
import { firestore } from "firebase-admin"
import temp



export const notifyIfPublished = async (change, context) => {
   try {
    logger.log(`change ${change} context ${context}`)
    const publishedAfter = change.after.data().isPublished
    const publishedBefore = change.before.data().isPublished
    if (publishedAfter && !publishedBefore){
        const {merchantId} = change.after.data()
        const ticketPurchasers = await db().collection(Collection.ORDER).where("merchantId","==", merchantId).get()
        const marketingConsentUsers = await db().collection(Collection.USER).where("marketingConsentStatus","==", "APPROVED").get()
        const purchaserIds = new Set(ticketPurchasers.docs.map((doc) => doc.data().userId))
        const consentUserEmails = marketingConsentUsers.docs.map((doc) => {
            return {userId: doc.id, email: doc.data().email}
        }).filter(i => purchaserIds.has(i.userId)).map((u) => u.email)
        logger.log(`ticketPurchasers ${ticketPurchasers} marketingConsentUsers ${marketingConsentUsers}
                    consentUsers ${consentUserEmails}`)
        if (consentUserEmails.length > 0){
            logger.log('sending email')
            sendEmail(consentUserEmails,'retargetingEmail',{'test'})
        }
        //const marketingConsentUsers = await ticketPurchasers.map((document) => document.data().userId)
        //sendEmail()
    }

   } catch (err) {
    logger.error(err)
  }
}
