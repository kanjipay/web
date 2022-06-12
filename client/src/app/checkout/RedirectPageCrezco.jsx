import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import LoadingPage from "../../components/LoadingPage";
import Collection from "../../enums/Collection";
import OrderType from "../../enums/OrderType";
import PaymentAttemptStatus from "../../enums/PaymentAttemptStatus";
import { IdentityManager } from "../../utils/IdentityManager";
import { NetworkManager } from "../../utils/NetworkManager";
import useBasket from "../customer/menu/basket/useBasket";

export default function RedirectPageCrezco() {
  const { clearBasket } = useBasket()
  const [searchParams] = useSearchParams()
  const paymentAttemptId = searchParams.get("paymentAttemptId")
  const navigate = useNavigate()
  const [paymentAttempt, setPaymentAttempt] = useState(null)
  const [order, setOrder] = useState(null)
  const [hasBegunPolling, setHasBegunPolling] = useState(false)
  const [hasPolledRecently, setHasPolledRecently] = useState(false)
  
  // First start subscribing to payment attempt updates
  useEffect(() => {
    return Collection.PAYMENT_ATTEMPT.onChange(paymentAttemptId, setPaymentAttempt)
  }, [paymentAttemptId])

  // Once you retrieve a payment attempt, get the order
  useEffect(() => {
    if (!paymentAttempt || order) { return }

    const { orderId } = paymentAttempt

    Collection.ORDER.get(orderId).then(setOrder)
  }, [paymentAttempt, order])

  // Finally, once both the payment attempt and order are retrieved, start listening for when the payment attempt status changes
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

  // The payment attempt status change relies on our webhook endpoint being called, which may not happen if the provider errors
  // Should wait 4 seconds then poll the payments endpoint every 1 second
  useEffect(() => {
    console.log("Running hasBegunPolling useEffect. hasBegunPolling: ", hasBegunPolling)

    if (hasBegunPolling) { return }

    setTimeout(() => {
      setHasBegunPolling(true)
    }, 3000)
  }, [hasBegunPolling])

  useEffect(() => {
    console.log("Running hasPolledRecently useEffect. hasBegunPolling: ", hasBegunPolling, " hasPolledRecently: ", hasPolledRecently)
    if (!hasBegunPolling || hasPolledRecently || !paymentAttempt) { return }

    setHasPolledRecently(true)

    const { paymentDemandId } = paymentAttempt.crezco
    const paymentAttemptId = paymentAttempt.id

    NetworkManager.post("/payment-attempts/crezco/check", { paymentDemandId, paymentAttemptId }).then(res => {
      
      const { isPending } = res.data

      console.log("Called polling endpoint successfully. isPending: ", isPending)

      if (isPending) {
        setTimeout(() => {
          setHasPolledRecently(false)
        }, 1000)
      }
    })
  }, [hasBegunPolling, hasPolledRecently, paymentAttempt])

  return <LoadingPage />
}