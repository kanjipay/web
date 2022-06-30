import { addBusinessDays } from "date-fns"
import { logger } from "firebase-functions/v1"
import Collection from "../shared/enums/Collection"
import OrderStatus from "../shared/enums/OrderStatus"
import PaymentAttemptStatus from "../shared/enums/PaymentAttemptStatus"
import { db } from "../shared/utils/admin"

export async function fetchDocumentsInArray(
  query: FirebaseFirestore.Query<FirebaseFirestore.DocumentData>, 
  fieldPath: string | FirebaseFirestore.FieldPath, 
  valuesArray: any[], 
  isPositive: boolean = true
) {
  const promises: Promise<FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>>[] = []

  let i = 0
  const chunkSize = 10

  while (i < valuesArray.length) {
    const valuesArraySlice = valuesArray.slice(i, i + chunkSize)

    const retrieveDocs = query
      .where(fieldPath, isPositive ? "in" : "not-in", valuesArray)
      .get()

    promises.push(retrieveDocs)

    i += valuesArraySlice.length
  }

  const querySnapshots = await Promise.all(promises)

  return querySnapshots
    .map(snapshot => snapshot.docs)
    .flat()
    .map(doc => { 
      const result: any = { id: doc.id, ...doc.data() }

      return result
    })
}

export const deleteTicketsForIncompletePayments = async context => {
  try {
    const threeBusinessDaysAgo = addBusinessDays(new Date(), -3)

    const paymentAttemptSnapshot = await db()
      .collection(Collection.PAYMENT_ATTEMPT)
      .where("status", "==", PaymentAttemptStatus.ACCEPTED)
      .where("createdAt", "<", threeBusinessDaysAgo)
      .get()

    const paymentAttempts: any[] = paymentAttemptSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

    logger.log("Got incomplete payment attempts", { paymentAttemptCount: paymentAttempts.length })

    if (paymentAttempts.length === 0) { return }

    const paymentAttemptIds = paymentAttempts.map(p => p.id)
    const orderIds = paymentAttempts.map(p => p.orderId)

    const tickets = await fetchDocumentsInArray(db().collection(Collection.TICKET), "orderId", orderIds)
    const ticketIds = tickets.map(doc => doc.id)

    // For all of these payment attempts, update them to failed, update the orders to abandoned and delete the associated tickets
    const batch = db().batch()

    for (const paymentAttemptId of paymentAttemptIds) {
      const docRef = db().collection(Collection.PAYMENT_ATTEMPT).doc(paymentAttemptId)
      batch.update(docRef, {
        status: PaymentAttemptStatus.FAILED
      })
    }

    for (const orderId of orderIds) {
      const docRef = db().collection(Collection.ORDER).doc(orderId)
      batch.update(docRef, {
        status: OrderStatus.CANCELLED
      })
    }

    for (const ticketId of ticketIds) {
      const docRef = db().collection(Collection.TICKET).doc(ticketId)
      batch.delete(docRef)
    }

    await batch.commit()
  } catch (err) {
    logger.log(err)
  }
}