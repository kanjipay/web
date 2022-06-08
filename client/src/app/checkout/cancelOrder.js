import OrderStatus from "../../enums/OrderStatus";
import OrderType from "../../enums/OrderType";
import { AnalyticsEvent, AnalyticsManager } from "../../utils/AnalyticsManager";

export function cancelOrder(order, navigate) {
  AnalyticsManager.main.logEvent(AnalyticsEvent.PRESS_BUTTON, {
    button: "cancelOrder",
  });

  const { type, merchantId } = order

  switch (type) {
    case OrderType.TICKETS:
      navigate(`/events/${merchantId}/${order.eventId}`)
      break;
    case OrderType.MENU:
      navigate(`/menu/${merchantId}`)
      break;
    default:
      navigate(`/`)
  }
}

export function redirectOrderIfNeeded(order, navigate, clearBasket = null) {
  const orderId = order.id
  const { status } = order

  switch (status) {
    case OrderStatus.PAID || OrderStatus.FULFILLED:
      switch (order.type) {
        case OrderType.TICKETS:
          navigate(`/events/s/orders/${orderId}/confirmation`)
          break;
        case OrderType.MENU:
          clearBasket()
          navigate(`/menu/orders/${orderId}/confirmation`)
          break;
        default:
      }
      break;
    case OrderStatus.PENDING:
      break;
    default:
      navigate(`/checkout/o/${orderId}/payment-cancelled`)
  }
}