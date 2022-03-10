import { collection, doc, getDoc, getDocs, onSnapshot, orderBy, query, updateDoc, where } from "firebase/firestore"
import { db } from "../FirebaseUtils"
import axios from 'axios'

export function createOrder(merchantId, basketItems) {
  const deviceId = localStorage.getItem("deviceId")

  const requestBody = {
    merchant_id: merchantId,
    device_id: deviceId,
    menu_items: basketItems
      .filter(item => item.merchant_id === merchantId)
      .map(item => {
        return { id: item.id, quantity: item.quantity }
      })
  }

  return axios.post(`${process.env.REACT_APP_SERVER_URL}/orders`, requestBody)
}

export function abandonOrder(orderId) {
  return axios.put(`${process.env.REACT_APP_SERVER_URL}/orders/${orderId}/abandon`)
}

export function fetchOrder(orderId, onComplete) {
  const orderRef = doc(db, "Order", orderId)

  getDoc(orderRef)
    .then(doc => {
      if (doc.exists()) {
        const order = { id: doc.id, ...doc.data() }

        const itemIds = order.menu_items.map(item => item.id)
        const menuItemCollectionRef = collection(db, "MenuItem")

        const menuItemsQuery = query(
          menuItemCollectionRef,
          where("__name__", "in", itemIds)
        )

        getDocs(menuItemsQuery)
          .then(snapshot => {
            const items = snapshot.docs.map(doc => {
              return { id: doc.id, ...doc.data() }
            })

            order.menu_items = order.menu_items.map(menuItem => {
              const item = items.find(e => e.id === menuItem.id)
              item.quantity = menuItem.quantity
              return item
            })

            onComplete(order)
          })

      } else {
        console.log("document doesn't exist")
      }
    })
    .catch(err => {
      console.log(err)
    })
}

export function fetchOrders(deviceId, merchantId, onComplete) {
  const ordersCollectionRef = collection(db, "Order")

  const ordersQuery = query(
    ordersCollectionRef,
    where("merchant_id", "==", merchantId),
    where("device_id", "==", deviceId),
    where("status", "==", "PAID"),
    orderBy("created_at", "desc")
  )

  return onSnapshot(ordersQuery, onComplete)
}

export function setOrderStatus(orderId, status) {
  const orderRef = doc(db, "Order", orderId)
  return updateDoc(orderRef, { status })
}

export function sendOrderReceipt(orderId, email) {
  const requestBody = {
    order_id: orderId,
    email
  }

  return axios.post(`${process.env.REACT_APP_SERVER_URL}/orders/email-receipt`, requestBody)
}