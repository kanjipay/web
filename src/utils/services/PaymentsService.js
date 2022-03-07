import { doc, updateDoc } from "firebase/firestore"
import { db } from "../FirebaseUtils"
import axios from "axios"

export function createPaymentAttempt(orderId) {
  const requestBody = { order_id: orderId }
  return axios.post("/payment-attempt", requestBody)
}

export function setPaymentAttemptStatus(paymentAttemptId, status) {
  const attemptRef = doc(db, "PaymentAttempt", paymentAttemptId)
  return updateDoc(attemptRef, { status })
}