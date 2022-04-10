import { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import LoadingPage from "../../../components/LoadingPage";
import { fetchOrder } from "../../../utils/services/OrdersService";
import CheckoutMethodPage from "./CheckoutMethodPage";
import EmailSubmittedPage from "./EmailSubmittedPage";
import PaymentCancelledPage from "./PaymentCancelledPage";
import PaymentFailurePage from "./PaymentFailurePage";
import PaymentPagePlaid from "./PaymentPagePlaid";
import PaymentSuccessPage from "./PaymentSuccessPage";

export default function Checkout() {
  const [orderId, setOrderId] = useState("");
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState(null);

  console.log("Checkout");
  // const usePlaid = true;
  // process.env.REACT_APP_ENV_NAME === "PROD" ? true : false;
  function updateStatus(newStatus) {
    setStatus(newStatus);
  }

  useEffect(() => {
    console.log(localStorage.getItem("orderId"));

    setOrderId(localStorage.getItem("orderId"));

    if (orderId) {
      fetchOrder(orderId).then((order) => {
        setOrder(order);
      });
    }
  }, [orderId]);

  console.log(order);

  return order ? (
    <Routes>
      {/* <Route path="payment" element={<PaymentPagePlaid />} /> */}
      <Route
        path="payment"
        element={<PaymentPagePlaid order={order} updateStatus={updateStatus} />}
      />
      <Route path="payment-method" element={<CheckoutMethodPage />} />
      <Route
        path="payment-success"
        element={<PaymentSuccessPage order={order} status={status} />}
      />
      <Route
        path="payment-failure"
        element={<PaymentFailurePage order={order} />}
      />
      <Route
        path="payment-cancelled"
        element={<PaymentCancelledPage order={order} />}
      />
      <Route
        path="email-submitted"
        element={<EmailSubmittedPage order={order} />}
      />
    </Routes>
  ) : (
    <LoadingPage />
  );
}
