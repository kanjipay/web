import {
  getDoc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import axios from "axios";
import OrderStatus from "../../enums/OrderStatus";
import Collection from "../../enums/Collection";
import { IdentityManager } from "../IdentityManager";

export async function createOrder(merchantId, basketItems) {
  const deviceId = IdentityManager.main.getDeviceId();
  const userId = IdentityManager.main.getPseudoUserId()

  const requestedItems = basketItems
    .filter((item) => item.merchantId === merchantId)
    .map((item) => ({
      id: item.id,
      quantity: item.quantity,
      title: item.title,
    }))
    console.log(process.env.REACT_APP_BASE_SERVER_URL)
  const res = await axios.post(`${process.env.REACT_APP_BASE_SERVER_URL}/onlineMenu/api/v1/orders`, {
    merchantId,
    deviceId,
    userId,
    requestedItems
  });

  const { checkoutUrl, orderId } = res.data

  return { checkoutUrl, orderId };
}

export async function fetchOrder(orderId, onComplete) {
  return onSnapshot(
    Collection.ORDER.docRef(orderId), 
    onComplete
  );
}

export function fetchOrders(merchantId, onComplete) {
  const userId = IdentityManager.main.getPseudoUserId()
  
  const ordersQuery = query(
    Collection.ORDER.ref,
    where("merchantId", "==", merchantId),
    where("userId", "==", userId),
    where("status", "==", OrderStatus.PAID),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(ordersQuery, onComplete);
}

export function setOrderStatus(orderId, status) {
  return updateDoc(Collection.ORDER.docRef(orderId), { status });
}

export function sendOrderReceipt(orderId, email) {
  const requestBody = {
    orderId,
    email,
  };

  return axios.post(
    `${process.env.REACT_APP_BASE_SERVER_URL}/onlineMenu/api/v1/orders/email-receipt`,
    requestBody
  );
}
