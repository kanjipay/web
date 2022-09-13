import { logger } from "firebase-functions/v1"
import Collection from "../shared/enums/Collection"
import { db } from "../shared/utils/admin"
import { subDays } from "date-fns"
import { firestore } from "firebase-admin"
import { TemplateName } from "../shared/utils/sendEmail"
import { sendgridClient } from "../shared/utils/sendgridClient"
import OrderStatus from "../shared/enums/OrderStatus"
import PaymentAttemptStatus from "../shared/enums/PaymentAttemptStatus"
import {BigQuery} from '@google-cloud/bigquery';


async function findConcludedEvents(){
    // get events finished within last 24 hours
    const concludedEventSnapshot = await db()
      .collection(Collection.EVENT)
      .where("endsAt", "<", new Date())
      .where("endsAt", ">", subDays(new Date(),1))
      .where("isPublished", "==", true)
      .get()
    logger.log("Got concluded events", {
      concludedEvents: concludedEventSnapshot.docs.length,
    })
    return concludedEventSnapshot
}

async function sendEventEmails(eventDocs){
  let messageParams = []
  eventDocs.forEach(event=>{
    const {merchantId, title} = event.data()
    const eventId = event.id
    const emailText =  `New event finished \n env ${process.env.ENVIRONMENT} \n merchant ${merchantId} \n event ${eventId} \n description ${title} \n`
    const messageParam = {
        to: "team@mercadopay.co",
        from: "team@mercadopay.co",
        text: emailText,
        subject: "New Event finished",
    }
    // todo create invoice
    messageParams.push(messageParam)
  })
  if (messageParams.length > 0){
    await sendgridClient().sendMultiple(messageParams)
  }
}

export const createSalesSummary = async () => {
  try {
    logger.log("Find events to send summary emails")
    const concludedEvents = await findConcludedEvents()
    logger.log({concludedEvents})
    await sendEventEmails(concludedEvents)
    logger.log('done')
  } catch (err) {
    logger.error(err)
  }
}
