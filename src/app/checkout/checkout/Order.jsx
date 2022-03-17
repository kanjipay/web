import { useEffect, useState } from "react";
import { Route, Routes, useParams } from "react-router-dom";
import { fetchOrder } from "../../../utils/services/OrdersService";
import CheckoutMethodPage from "./CheckoutMethodPage";
import EmailSubmittedPage from "./EmailSubmittedPage";
import PaymentCancelledPage from "./PaymentCancelledPage";
import PaymentFailurePage from "./PaymentFailurePage";
import PaymentPagePlaid from "./PaymentPagePlaid";
import PaymentPageTruelayer from "./PaymentPageTruelayer";
import PaymentSuccessPage from "./PaymentSuccessPage";

export default function Order() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    fetchOrder(orderId).then((order) => {
      setOrder(order);
    });
  }, [orderId]);

  return (
    <Routes>
      {/* <Route path="payment" element={<PaymentPagePlaid />} /> */}
      <Route path="payment" element={<PaymentPageTruelayer />} />
      <Route path="payment-method" element={<CheckoutMethodPage />} />
      <Route
        path="payment-success"
        element={<PaymentSuccessPage order={order} />}
      />
      <Route path="payment-failure" element={<PaymentFailurePage />} />
      <Route path="payment-cancelled" element={<PaymentCancelledPage />} />
      <Route path="email-submitted" element={<EmailSubmittedPage />} />
    </Routes>
  );
}
