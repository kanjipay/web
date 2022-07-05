import { IdentityManager } from "../IdentityManager"
import { NetworkManager } from "../NetworkManager"

export async function createMenuOrder(merchantId, basketItems) {
  const deviceId = IdentityManager.main.getDeviceId()
  const userId = IdentityManager.main.getPseudoUserId()

  const requestedItems = basketItems
    .filter((item) => item.merchantId === merchantId)
    .map((item) => ({
      id: item.id,
      quantity: item.quantity,
      title: item.title,
    }))

  const res = await NetworkManager.post("/orders/menu", {
    merchantId,
    deviceId,
    userId,
    requestedItems,
  })

  const { orderId } = res.data

  return { orderId }
}

export async function createTicketOrder(productId, quantity, attributionItem) {
  const deviceId = IdentityManager.main.getDeviceId()

  const res = await NetworkManager.post("/orders/tickets", {
    productId,
    quantity,
    deviceId,
    attributionData: attributionItem?.attributionData,
  })

  const { orderId, redirectPath } = res.data

  return { orderId, redirectPath }
}

export function sendOrderReceipt(orderId, email) {
  return NetworkManager.post("/orders/email-receipt", {
    orderId,
    email,
  })
}
