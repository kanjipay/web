import { logger } from "firebase-functions/v1"
import Collection from "../shared/enums/Collection"
import { db } from "../shared/utils/admin"
import { subDays } from "date-fns"
import { sendgridClient } from "../shared/utils/sendgridClient"
import OrderStatus from "../shared/enums/OrderStatus"

const STRIPE_FIXED_FEE = 0.2

const STRIPE_VARIABLE_FEE = 0.14

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

async function createEventData(eventDoc){
  const {merchantId, title} = eventDoc.data()
  const eventId = eventDoc.id
  const eventDocs = await db()
  .collection(Collection.ORDER)
  .where("eventId", "==", eventId)
  .where("status","==",OrderStatus.PAID)
  .get()
  let totalTickets = 0
  let totalFaceValue = 0
  let totalStripeFees = 0
  let totalMerchantBookingFees = 0
  let totalMercadoBookingFees = 0
  eventDocs.forEach((eventDoc)=>{
    const {customerFee, mercadoFee, orderItems, paymentType} = eventDoc.data()
    if(paymentType != 'CREZCO'){
      totalStripeFees += STRIPE_FIXED_FEE
    } // once not missing for any live events, change to == STRIPE
    orderItems.forEach((orderItem) => {
      const {price, quantity} = orderItem
      const value = price * quantity
      totalFaceValue += value
      if(paymentType != 'CREZCO'){
        totalStripeFees += (value * STRIPE_VARIABLE_FEE)
      } // once not missing for any live events, change to == STRIPE
      totalMerchantBookingFees += (customerFee-mercadoFee) * value
      totalMercadoBookingFees += mercadoFee * value
      totalTickets += quantity
    })
  })
  const merchantEarnings = totalFaceValue + totalMerchantBookingFees - totalStripeFees
  const eventDetails = {env:process.env.ENVIRONMENT,
                        merchantId,
                        eventId,
                        eventTitle:title,
                        merchantEarnings, 
                        totalTickets,
                        totalFaceValue,
                        totalStripeFees,
                        totalMerchantBookingFees,
                        totalMercadoBookingFees
                      }

  const emailText =  `New event finished 
                        ${eventDetails}`
  logger.log({emailText})
  const messageParam = {
      to: "team@mercadopay.co",
      from: "team@mercadopay.co",
      text: emailText,
      subject: "New Event finished",
  }
  return messageParam
}
async function sendEventEmails(eventDocs){
  let messageParams = []
  logger.log('sending event emails')
  eventDocs.forEach(eventDoc=>{
    messageParams.push(createEventData(eventDoc))
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
