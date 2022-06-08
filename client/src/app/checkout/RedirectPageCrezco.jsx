import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import LoadingPage from "../../components/LoadingPage";
import Collection from "../../enums/Collection";
import OrderType from "../../enums/OrderType";
import PaymentAttemptStatus from "../../enums/PaymentAttemptStatus";
import { IdentityManager } from "../../utils/IdentityManager";
import useBasket from "../customer/menu/basket/useBasket";

export default function RedirectPageCrezco() {
  const { clearBasket } = useBasket()
  const [searchParams] = useSearchParams()
  const paymentAttemptId = searchParams.get("paymentAttemptId")
  const navigate = useNavigate()
  const [paymentAttempt, setPaymentAttempt] = useState(null)
  const [order, setOrder] = useState(null)
  
  // First start subscribing to payment attempt updates
  useEffect(() => {
    return Collection.PAYMENT_ATTEMPT.onChange(paymentAttemptId, setPaymentAttempt)
  }, [paymentAttemptId])

  // Once you retrieve a payment attempt, get the order
  useEffect(() => {
    if (!paymentAttempt || order) { return }

    const { orderId } = paymentAttempt

    Collection.ORDER.get(orderId).then(setOrder)
  }, [paymentAttempt, order, navigate])


  useEffect(() => {
    if (!paymentAttempt || !order) { return }

    const currentDeviceId = IdentityManager.main.getDeviceId()

    const { status, deviceId, orderId } = paymentAttempt

    switch (status) {
      case PaymentAttemptStatus.SUCCESSFUL:
        if (currentDeviceId === deviceId) {
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
        } else {
          navigate(`/checkout/o/${orderId}/mobile-finished`)
        }
        break;
      case PaymentAttemptStatus.FAILED:
        navigate(`/checkout/o/${orderId}/payment-failure`);
        break;
      default:
    }
  }, [paymentAttempt, order, navigate, clearBasket])

  return <LoadingPage />
}