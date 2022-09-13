import { logger } from "firebase-functions/v1"
import Collection from "../shared/enums/Collection"
import { db } from "../shared/utils/admin"
import { subDays } from "date-fns"
import { sendgridClient } from "../shared/utils/sendgridClient"


async function findConcludedEvents(){
    // get events finished within last 24 hours
    const concludedEventSnapshot = await db()
      .collection(Collection.EVENT)
      .where("endsAt", "<", new Date())
      .where("endsAt", ">", subDays(new Date(),1))
      .where("isPublished", "==", true)
      .get()
    logger.log(`Got concluded events n ${concludedEventSnapshot.docs.length}`)
    return concludedEventSnapshot
}

async function sendEventEmails(eventDocs){
  let messageParams = []
  logger.log('sending event emails')
  eventDocs.forEach(event=>{
    const {merchantId, title} = event.data()
    const eventId = event.id
    const emailText =  `New event finished \n env ${process.env.ENVIRONMENT} \n merchant ${merchantId} \n event ${eventId} \n description ${title} \n`
    logger.log({emailText})
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
    logger.log('sending emails')
    await sendgridClient().sendMultiple(messageParams)
  }
}

export const createSalesSummary = async () => {
  try {
    logger.log("Find events to send summary emails")
    const concludedEvents = await findConcludedEvents()
    logger.log({concludedEvents})
    await sendEventEmails(concludedEvents.docs)
    logger.log('done')
  } catch (err) {
    logger.error(err)
  }
}
