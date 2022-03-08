import { doc, updateDoc } from "firebase/firestore"
import { db } from "../FirebaseUtils"
import axios from "axios"

export function createPaymentAttempt(orderId) {
  const requestBody = { order_id: orderId }
  return axios.post(`${process.env.REACT_APP_SERVER_URL}/payment-attempt`, requestBody)
}

export function setPaymentAttemptStatus(paymentAttemptId, status) {
  const attemptRef = doc(db, "PaymentAttempt", paymentAttemptId)
  return updateDoc(attemptRef, { status })
}