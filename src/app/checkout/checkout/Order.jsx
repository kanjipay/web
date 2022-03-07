import { useEffect, useState } from "react";
import { Route, Routes, useParams } from "react-router-dom";
import { fetchOrder } from "../../../utils/services/OrdersService";
import CheckoutMethodPage from "./CheckoutMethodPage";
import EmailSubmittedPage from "./EmailSubmittedPage";
import PaymentCancelledPage from "./PaymentCancelledPage";
import PaymentFailurePage from "./PaymentFailurePage";
import PaymentPage from "./PaymentPage";
import PaymentSuccessPage from "./PaymentSuccessPage";

export default function Order() {
  const { orderId } = useParams()

  const [order, setOrder] = useState(null)

  useEffect(() => {
    fetchOrder(orderId)
      .then(doc => {
        if (doc.exists()) {
          setOrder({ id: doc.id, ...doc.data()})
        }
      })
  }, [orderId])

  return <Routes>
    <Route path="payment" element={<PaymentPage />} />
    <Route path="payment-method" element={<CheckoutMethodPage />} />
    <Route path="payment-success" element={<PaymentSuccessPage order={order} />} />
    <Route path="payment-failure" element={<PaymentFailurePage />} />
    <Route path="payment-cancelled" element={<PaymentCancelledPage />} />
    <Route path="email-submitted" element={<EmailSubmittedPage />} />
  </Routes>
}