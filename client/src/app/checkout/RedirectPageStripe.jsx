import { where } from "firebase/firestore"
import { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import LoadingPage from "../../components/LoadingPage"
import Collection from "../../enums/Collection"
import OrderType from "../../enums/OrderType"
import PaymentAttemptStatus from "../../enums/PaymentAttemptStatus"
import { PaymentType } from "../../enums/PaymentType"
import { AnalyticsManager } from "../../utils/AnalyticsManager"
import useBasket from "../customer/menu/basket/useBasket"

export default function RedirectPageStripe() {
  const [paymentAttempt, setPaymentAttempt] = useState(null)
  const [order, setOrder] = useState(null)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { clearBasket } = useBasket()

  const stripePaymentIntentId = searchParams.get("payment_intent")

  useEffect(() => {
    AnalyticsManager.main.viewPage("StripePaymentRedirect", {
      stripePaymentIntentId,
    })
  }, [stripePaymentIntentId])

  useEffect(() => {
    return Collection.PAYMENT_ATTEMPT.queryOnChangeGetOne(
      setPaymentAttempt,
      where("stripe.paymentIntentId", "==", stripePaymentIntentId)
    )
  }, [stripePaymentIntentId])

  useEffect(() => {
    if (!paymentAttempt || order) {
      return
    }

    const { orderId } = paymentAttempt

    Collection.ORDER.get(orderId).then(setOrder)
  }, [paymentAttempt, order])

  useEffect(() => {
    if (!paymentAttempt || !order) {
      return
    }

    const { status, orderId } = paymentAttempt

    switch (status) {
      case PaymentAttemptStatus.SUCCESSFUL:
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
      case PaymentAttemptStatus.FAILED:
        navigate(`/checkout/o/${orderId}/payment-failure`, {
          state: {
            retryPath: `/checkout/o/${orderId}/payment-stripe`,
            paymentType: PaymentType.STRIPE,
          },
        })
        break
      default:
    }
  }, [paymentAttempt, order, navigate, clearBasket])

  return <LoadingPage />
}
