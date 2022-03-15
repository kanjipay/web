import { updateDoc } from "firebase/firestore";
import axios from "axios";
import Collection from "../../enums/Collection";

export function createPaymentAttempt(orderId) {
  const requestBody = { order_id: orderId };
  console.log(requestBody);
  return axios.post(
    `${process.env.REACT_APP_SERVER_URL}/payment-attempts`,
    requestBody
  );
}

export function setPaymentAttemptStatus(paymentAttemptId, status) {
  return updateDoc(Collection.PAYMENT_ATTTEMPT.docRef(paymentAttemptId), {
    status,
  });
}
