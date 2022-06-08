import { useEffect, useState } from "react";
import { Route, Routes, useParams } from "react-router-dom";
import LoadingPage from "../../components/LoadingPage";
import PaymentCancelledPage from "./PaymentCancelledPage";
import PaymentFailurePage from "./PaymentFailurePage";
import MobileHandoverPage from "./MobileHandoverPage";
import Collection from "../../enums/Collection";
import MobileFinishedPage from "./MobileFinishedPage";
import ChooseBankCrezcoPage from "./ChooseBankCrezcoPage";
import PaymentPageCrezco from "./PaymentPageCrezco";

export default function Order() {
  const [order, setOrder] = useState(null);
  const { orderId } = useParams()

  useEffect(() => {
    return Collection.ORDER.onChange(orderId, setOrder)
  }, [orderId]);

  return order ? 
    <Routes>
      <Route path="payment" element={<PaymentPageCrezco order={order} />} />
      <Route path="choose-bank" element={<ChooseBankCrezcoPage order={order} />} />
      <Route path="mobile-handover" element={<MobileHandoverPage order={order} />} />
      <Route path="mobile-finished" element={<MobileFinishedPage />} />
      <Route path="payment-failure" element={<PaymentFailurePage order={order} />} />
      <Route path="payment-cancelled" element={<PaymentCancelledPage order={order} />} />
    </Routes> :
    <LoadingPage />
}