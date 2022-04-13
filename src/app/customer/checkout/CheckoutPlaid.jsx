import { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import LoadingPage from "../../../components/LoadingPage";
import { fetchOrder } from "../../../utils/services/OrdersService";
import PaymentMethodPage from "./PaymentMethodPage";
import EmailSubmittedPage from "./EmailSubmittedPage";
import PaymentCancelledPage from "./PaymentCancelledPage";
import PaymentFailurePage from "./PaymentFailurePage";
import PaymentPagePlaid from "./PaymentPagePlaid";
import PaymentSuccessPage from "./PaymentSuccessPage";

export default function CheckoutPlaid() {
  const [order, setOrder] = useState(null);
  // const usePlaid = true;
  // process.env.REACT_APP_ENV_NAME === "PROD" ? true : false;

  const [status, setStatus] = useState(null);

  console.log("Checkout");
  // const usePlaid = true;
  // process.env.REACT_APP_ENV_NAME === "PROD" ? true : false;
  function updateStatus(newStatus) {
    setStatus(newStatus);
  }

  useEffect(() => {
    const orderId = localStorage.getItem("orderId")

    let unsub

    if (orderId) {
      unsub = fetchOrder(orderId, doc => {
        const order = { id: doc.id, ...doc.data() }
        setOrder(order);
      })
    }

    return () => {
      if (unsub) { unsub() }
    }
  }, []);

  return order ? (
    <Routes>
      <Route
        path="payment"
        element={<PaymentPagePlaid order={order} updateStatus={updateStatus} />}
      />
      <Route path="payment-method" element={<PaymentMethodPage />} />
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
      <Route path="payment" element={<PaymentPagePlaid />} />
    </Routes>
  ) : (
    <LoadingPage />
  );
}
