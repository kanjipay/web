import { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import LoadingPage from "../../../components/LoadingPage";
import { fetchOrder } from "../../../utils/services/OrdersService";
import CheckoutMethodPage from "./CheckoutMethodPage";
import EmailSubmittedPage from "./EmailSubmittedPage";
import PaymentCancelledPage from "./PaymentCancelledPage";
import PaymentFailurePage from "./PaymentFailurePage";
import PaymentPagePlaid from "./PaymentPagePlaid";
import PaymentPageTruelayer from "./PaymentPageTruelayer";
import PaymentSuccessPage from "./PaymentSuccessPage";

export default function Checkout() {
  const [orderId, setOrderId] = useState("");
  const [order, setOrder] = useState(null);
  const usePlaid = true;
  // process.env.REACT_APP_ENV_NAME === "PROD" ? true : false;

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
      {usePlaid ? (
        <Route path="payment" element={<PaymentPagePlaid order={order} />} />
      ) : (
        <Route
          path="payment"
          element={<PaymentPageTruelayer order={order} />}
        />
      )}
      <Route path="payment-method" element={<CheckoutMethodPage />} />
      <Route
        path="payment-success"
        element={<PaymentSuccessPage order={order} />}
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
