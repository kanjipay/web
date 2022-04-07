import { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import LoadingPage from "../../../components/LoadingPage";
import { fetchOrder } from "../../../utils/services/OrdersService";
// import PaymentMethodPage from "./PaymentMethodPage";
import EmailSubmittedPage from "./EmailSubmittedPage";
import PaymentCancelledPage from "./PaymentCancelledPage";
import PaymentFailurePage from "./PaymentFailurePage";
import PaymentPagePlaid from "./PaymentPagePlaid";
import PaymentSuccessPage from "./PaymentSuccessPage";

export default function CheckoutPlaid() {
  const [order, setOrder] = useState(null);
  // const usePlaid = true;
  // process.env.REACT_APP_ENV_NAME === "PROD" ? true : false;

  useEffect(() => {
    const orderId = localStorage.getItem("orderId")

    if (orderId) {
      fetchOrder(orderId).then((order) => {
        setOrder(order);
      });
    }
  }, []);

  return order ? (
    <Routes>
      <Route path="payment" element={<PaymentPagePlaid />} />
      {/* <Route path="payment-method" element={<PaymentMethodPage order={order} />} /> */}
      <Route path="payment-success" element={<PaymentSuccessPage order={order} />} />
      <Route path="payment-failure" element={<PaymentFailurePage order={order} />} />
      <Route path="payment-cancelled" element={<PaymentCancelledPage order={order} />} />
      <Route path="email-submitted" element={<EmailSubmittedPage order={order} />} />
    </Routes>
  ) : (
    <LoadingPage />
  );
}
