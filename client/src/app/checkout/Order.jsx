import { useEffect, useState } from "react"
import { Route, Routes, useParams } from "react-router-dom"
import PaymentCancelledPage from "./PaymentCancelledPage"
import PaymentFailurePage from "./PaymentFailurePage"
import MobileHandoverPage from "./MobileHandoverPage"
import Collection from "../../enums/Collection"
import MobileFinishedPage from "./MobileFinishedPage"
import ChooseBankCrezcoPage from "./ChooseBankCrezcoPage"
import PaymentPageCrezco from "./PaymentPageCrezco"
import PaymentPageStripe from "./PaymentPageStripe"

export default function Order() {
  const [order, setOrder] = useState(null)
  const { orderId } = useParams()

  useEffect(() => {
    return Collection.ORDER.onChange(orderId, setOrder)
  }, [orderId])

  return <Routes>
    <Route path="payment" element={<PaymentPageCrezco order={order} />} />
    <Route
      path="payment-stripe"
      element={<PaymentPageStripe order={order} />}
    />
    <Route
      path="choose-bank"
      element={<ChooseBankCrezcoPage order={order} />}
    />
    <Route
      path="mobile-handover"
      element={<MobileHandoverPage />}
    />
    <Route path="mobile-finished" element={<MobileFinishedPage />} />
    <Route
      path="payment-failure"
      element={<PaymentFailurePage />}
    />
    <Route
      path="payment-cancelled"
      element={<PaymentCancelledPage />}
    />
  </Routes>
}
