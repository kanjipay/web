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

  const { redirectUrl, orderId } = res.data

  return { redirectUrl, orderId }
}

export function sendOrderReceipt(orderId, email) {
  return NetworkManager.post(ApiName.ONLINE_MENU, "/orders/email-receipt", {
    orderId,
    email,
  })
}
