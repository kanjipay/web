import {
  getDocs,
  onSnapshot,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import axios from "axios";
import Collection from "../../enums/Collection";
import { saveState } from "./StateService";
import { v4 as uuid } from "uuid"

export async function createPaymentAttemptCrezco(paymentIntentId, bankCode, deviceId) {
  const res = await axios.post(`${process.env.REACT_APP_BASE_SERVER_URL}/internal/api/v1/payment-attempts/crezco`, {
    paymentIntentId,
    deviceId,
    crezcoBankCode: bankCode
  })

  const { redirectUrl } = res.data

  return redirectUrl
}

export async function createPaymentAttemptMoneyhub(paymentIntentId, bankId, deviceId) {
  const clientState = uuid()
  const stateId = await saveState({ clientState })

  const res = await axios.post(`${process.env.REACT_APP_BASE_SERVER_URL}/internal/api/v1/payment-attempts`, {
    paymentIntentId,
    deviceId,
    stateId,
    clientState,
    moneyhubBankId: bankId
  });

  const { authUrl } = res.data

  return authUrl
}

export async function confirmPayment(code, state, idToken) {
  try {
    const res = await axios.post(`${process.env.REACT_APP_BASE_SERVER_URL}/internal/api/v1/payment-attempts/confirm`, {
      code,
      state,
      idToken,
    })

    const { paymentAttemptId } = res.data

    return paymentAttemptId
  } catch (err) {
    console.log(err)
  }
}

export function fetchPaymentAttempt(paymentAttemptId, onComplete) {
  return onSnapshot(
    Collection.PAYMENT_ATTEMPT.docRef(paymentAttemptId),
    onComplete
  );
}

export async function fetchProviderPaymentAttempt(paymentId, provider) {
  const q = query(
    Collection.PAYMENT_ATTEMPT.ref,
    where(`${provider.toLowerCase()}.paymentId`, "==", paymentId)
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
