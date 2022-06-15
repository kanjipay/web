import { useEffect, useState } from "react";
import { Route, Routes, useParams } from "react-router-dom";
import Collection from "../../../../enums/Collection";
import LoadingPage from "../../../../components/LoadingPage";
import OrderConfirmationPage from "./OrderConfirmationPage"
import EmailSubmittedPage from "./EmailSubmittedPage"

export default function Order() {
  const { orderId } = useParams()
  const [order, setOrder] = useState(null)

  useEffect(() => {
    return Collection.ORDER.onChange(orderId, setOrder)
  }, [orderId])

  return order ?
    <Routes>
      <Route path="confirmation" element={<OrderConfirmationPage order={order} />} />
      <Route path="email-submitted" element={<EmailSubmittedPage order={order} />} />
    </Routes> :
    <LoadingPage />
}