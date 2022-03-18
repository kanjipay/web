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
import { AnalyticsManager } from "../AnalyticsManager";

export async function createOrder(merchantId, basketItems) {
  const deviceId = AnalyticsManager.main.getDeviceId();

  

  const body = {
    merchantId,
    deviceId,
    requestedItems: basketItems
      .filter((item) => item.merchantId === merchantId)
      .map((item) => ({
        id: item.id,
        quantity: item.quantity,
        title: item.title,
      })),
  };

  console.log("createOrder: ", body)

  const res = await axios.post(
    `${process.env.REACT_APP_SERVER_URL}/orders`,
    body
  );

  console.log("returnData: ", res.data)

  return res.data.orderId;
}

export async function fetchOrder(orderId) {
  const orderDoc = await getDoc(Collection.ORDER.docRef(orderId));

  if (!orderDoc.exists()) {
    throw new Error(`No order with id ${orderId}`);
  }

  return { id: orderDoc.id, ...orderDoc.data() };
}

export function fetchOrders(deviceId, merchantId, onComplete) {
  const ordersQuery = query(
    Collection.ORDER.ref,
    where("merchantId", "==", merchantId),
    where("deviceId", "==", deviceId),
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
    `${process.env.REACT_APP_SERVER_URL}/orders/email-receipt`,
    requestBody
  );
}
