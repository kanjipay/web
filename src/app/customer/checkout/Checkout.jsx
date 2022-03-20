import { useEffect, useState } from "react";
import { Route, Routes, useParams } from "react-router-dom";
import LoadingPage from "../../../components/LoadingPage";
import { fetchOrder } from "../../../utils/services/OrdersService";
import CheckoutMethodPage from "./CheckoutMethodPage";
import EmailSubmittedPage from "./EmailSubmittedPage";
import PaymentCancelledPage from "./PaymentCancelledPage";
import PaymentFailurePage from "./PaymentFailurePage";
// import PaymentPagePlaid from "./PaymentPagePlaid";
import PaymentPageTruelayer from "./PaymentPageTruelayer";
import PaymentSuccessPage from "./PaymentSuccessPage";

export default function Checkout() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    fetchOrder(orderId).then((order) => {
      console.log(order)
      setOrder(order);
    });
  }, [orderId]);

  return (
    order ?
      <Routes>
        {/* <Route path="payment" element={<PaymentPagePlaid />} /> */}
        <Route path="payment" element={<PaymentPageTruelayer />} />
        <Route path="payment-method" element={<CheckoutMethodPage />} />
        <Route
          path="payment-success"
          element={<PaymentSuccessPage order={order} />}
        />
        <Route path="payment-failure" element={<PaymentFailurePage order={order} />} />
        <Route path="payment-cancelled" element={<PaymentCancelledPage order={order} />} />
        <Route path="email-submitted" element={<EmailSubmittedPage order={order} />} />
      </Routes> :
      <LoadingPage />
  );
}
