import { useEffect, useState } from "react";
import { Route, Routes, useParams } from "react-router-dom";
import LoadingPage from "../../../components/LoadingPage";
import { fetchOrder } from "../../../utils/services/OrdersService";
// import PaymentMethodPage from "./PaymentMethodPage";
import ConfirmBankPage from "./ConfirmBankPage";
import EmailSubmittedPage from "./EmailSubmittedPage";
import PaymentCancelledPage from "./PaymentCancelledPage";
import PaymentFailurePage from "./PaymentFailurePage";
import PaymentSuccessPage from "./PaymentSuccessPage";
import ChooseBankPage from "./ChooseBankPage";
import PaymentPageMoneyhub from "./PaymentPageMoneyhub";
import MobileHandoverPage from "./MobileHandoverPage";

export default function Checkout() {
  const [order, setOrder] = useState(null);
  const { orderId } = useParams()

  useEffect(() => {
    const unsub = fetchOrder(orderId, doc => {
      const order = { id: doc.id, ...doc.data() }
      console.log("updated order: ", order)
      setOrder(order);
    })

    return unsub
  }, [orderId]);

  return order ? 
    <Routes>
      <Route path="payment" element={<PaymentPageMoneyhub order={order} />} />
      <Route path="choose-bank" element={<ChooseBankPage order={order} />} />
      <Route path="confirm-bank" element={<ConfirmBankPage order={order} />} />
      <Route path="confirm-bank/:bankId" element={<ConfirmBankPage order={order} />} />
      <Route path="mobile-handover" element={<MobileHandoverPage order={order} />} />
      <Route path="payment-success" element={<PaymentSuccessPage order={order} />} />
      <Route path="payment-failure" element={<PaymentFailurePage order={order} />} />
      <Route path="payment-cancelled" element={<PaymentCancelledPage order={order} />} />
      <Route path="email-submitted" element={<EmailSubmittedPage order={order} />} />
    </Routes> :
    <LoadingPage />
}
