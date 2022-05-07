import {
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
import { ApiName, NetworkManager } from "../NetworkManager";

export async function createMenuOrder(merchantId, basketItems) {
  const deviceId = IdentityManager.main.getDeviceId();
  const userId = IdentityManager.main.getPseudoUserId()

  const requestedItems = basketItems
    .filter((item) => item.merchantId === merchantId)
    .map((item) => ({
      id: item.id,
      quantity: item.quantity,
      title: item.title,
    }))

  const res = await NetworkManager.post(ApiName.ONLINE_MENU, "/orders/menu", {
    merchantId,
    deviceId,
    userId,
    requestedItems
  })

  const { checkoutUrl, orderId } = res.data

  return { checkoutUrl, orderId };
}

export async function createTicketOrder(productId, quantity) {
  const deviceId = IdentityManager.main.getDeviceId()

  const res = await NetworkManager.post(ApiName.ONLINE_MENU, "/orders/tickets", {
    productId,
    quantity,
    deviceId
  })

  const { checkoutUrl, orderId } = res.data

  return { checkoutUrl, orderId }
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
  return NetworkManager.post(ApiName.ONLINE_MENU, "/orders/email-receipt", {
    orderId,
    email,
  })
}
