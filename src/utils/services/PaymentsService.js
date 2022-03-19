import { onSnapshot, updateDoc } from "firebase/firestore";
import axios from "axios";
import Collection from "../../enums/Collection";

export function createPaymentAttempt(orderId) {
  const requestBody = { orderId };

  return axios.post(
    `${process.env.REACT_APP_SERVER_URL}/payment-attempts`,
    requestBody
  );
}

export function fetchPaymentAttempt(paymentAttemptId, onComplete) {
  return onSnapshot(
    Collection.PAYMENT_ATTEMPT.docRef(paymentAttemptId),
    onComplete
  );
}

export function setPaymentAttemptStatus(paymentAttemptId, status) {
  return updateDoc(Collection.PAYMENT_ATTTEMPT.docRef(paymentAttemptId), {
    status,
  });
}
