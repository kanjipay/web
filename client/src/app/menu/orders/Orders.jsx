import { onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Route, Routes, useParams } from "react-router-dom";
import Collection from "../../../enums/Collection";
import LoadingPage from "../../components/LoadingPage";
import OrderPaidPage from "./OrderPaidPage"
import EmailSubmittedPage from "./EmailSubmittedPage"
import OrderAbandonedPage from "./OrderAbandonedPage"

export default function Orders() {
  const { orderId } = useParams()
  const [order, setOrder] = useState(null)

  useEffect(() => {
    const unsub = onSnapshot(Collection.ORDER.docRef(orderId), doc => {
      const order = { id: doc.id, ...doc.data() }
      setOrder(order)
    })

    return unsub
  }, [orderId])

  return order ?
    <Routes>
      <Route path="confirmation" element={<OrderPaidPage order={order} />} />
      <Route path="abandoned" element={<OrderAbandonedPage order={order} />} />
      <Route path="email-submitted" element={<EmailSubmittedPage order={order} />} />
    </Routes> :
    <LoadingPage />
}