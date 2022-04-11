import {
  getDocs,
  onSnapshot,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import axios from "axios";
import Collection from "../../enums/Collection";

export class OpenBankingProvider {
  static PLAID = "PLAID";
  static TRUELAYER = "TRUELAYER";
  static MONEYHUB = "MONEYHUB";
}

export function createPaymentAttempt(orderId, provider, isLocalEnvironment) {
  const requestBody = {
    orderId,
    openBankingProvider: provider,
    isLocalEnvironment: isLocalEnvironment,
  };

  console.log("createPaymentAttempt: ", requestBody);

  return axios.post(
    `${process.env.REACT_APP_SERVER_URL}/payment-attempts`,
    requestBody
  );
}

export async function createMoneyhubAuthUrl(orderId, bankId) {
  const res = await axios.post(
    `${process.env.REACT_APP_SERVER_URL}/payment-attempts/auth-url`,
    {
      orderId,
      bankId
    }
  )

  console.log(res.data)

  return res.data.authUrl
}

export function fetchPaymentAttempt(paymentAttemptId, onComplete) {
  return onSnapshot(
    Collection.PAYMENT_ATTEMPT.docRef(paymentAttemptId),
    onComplete
  );
}

export async function fetchTruelayerPaymentAttempt(paymentId) {
  const q = query(
    Collection.PAYMENT_ATTEMPT.ref,
    where("truelayer.paymentId", "==", paymentId)
  );
  const snapshot = await getDocs(q);

  if (snapshot.docs.length > 0) {
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() };
  }

  return null;
}

export function setPaymentAttemptStatus(paymentAttemptId, status) {
  return updateDoc(Collection.PAYMENT_ATTTEMPT.docRef(paymentAttemptId), {
    status,
  });
}
