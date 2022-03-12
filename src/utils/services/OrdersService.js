import { getDoc, onSnapshot, orderBy, query, updateDoc, where } from "firebase/firestore"
import axios from 'axios'
import OrderStatus from "../../enums/OrderStatus"
import Collection from "../../enums/Collection"

export async function createOrder(merchantId, basketItems) {
  const deviceId = localStorage.getItem("deviceId")

  const body = {
    merchant_id: merchantId,
    device_id: deviceId,
    requested_items: basketItems
      .filter(item => item.merchant_id === merchantId)
      .map(item => ({ id: item.id, quantity: item.quantity, title: item.title }))
  }
  const url = `${process.env.REACT_APP_SERVER_URL}/orders`;
  console.log(url);
  console.log(body);
  const res = await axios.post(url, body)

  return res.data.order_id
}

export async function fetchOrder(orderId) {
  const orderDoc = await getDoc(Collection.ORDER.docRef(orderId))

  if (!orderDoc.exists()) {
    throw new Error(`No order with id ${orderId}`)
  }

  const order = { id: orderDoc.id, ...orderDoc.data() }

  return order
}

export function fetchOrders(deviceId, merchantId, onComplete) {
  const ordersQuery = query(
    Collection.ORDER.ref,
    where("merchant_id", "==", merchantId),
    where("device_id", "==", deviceId),
    where("status", "==", OrderStatus.PAID),
    orderBy("created_at", "desc")
  )

  return onSnapshot(ordersQuery, onComplete)
}

export function setOrderStatus(orderId, status) {
  return updateDoc(
    Collection.ORDER.docRef(orderId), 
    { status }
  )
}

export function sendOrderReceipt(orderId, email) {
  const requestBody = {
    order_id: orderId,
    email
  }

  return axios.post(`${process.env.REACT_APP_SERVER_URL}/orders/email-receipt`, requestBody)
}