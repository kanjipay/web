import OrderStatus from "../../enums/OrderStatus"
import OrderType from "../../enums/OrderType"
import { AnalyticsEvent, AnalyticsManager } from "../../utils/AnalyticsManager"
import { NetworkManager } from "../../utils/NetworkManager"

export async function cancelOrder(orderId, navigate) {
  AnalyticsManager.main.logEvent(AnalyticsEvent.PRESS_BUTTON, {
    button: "cancelOrder",
  })

  const res = await NetworkManager.put(`/orders/o/${orderId}/abandon`)

  navigate(res.data.redirectPath)
}

export function redirectOrderIfNeeded(order, navigate, clearBasket = null) {
  const orderId = order.id
  const { status } = order

  switch (status) {
    case OrderStatus.PAID || OrderStatus.FULFILLED:
      switch (order.type) {
        case OrderType.TICKETS:
          navigate(`/events/s/orders/${orderId}/confirmation`)
          break
        case OrderType.MENU:
          clearBasket()
          navigate(`/menu/orders/${orderId}/confirmation`)
          break
        default:
      }
      break
    case OrderStatus.PENDING:
      break
    default:
      navigate(`/checkout/o/${orderId}/payment-cancelled`)
  }
}
