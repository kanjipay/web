import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchPaymentAttempt } from "../../../utils/services/PaymentsService";
import PaymentAttemptStatus from "../../../enums/PaymentAttemptStatus";
import LoadingPage from "../../../components/LoadingPage";
import useBasket from "../basket/useBasket";

export default function RedirectPagePlaid() {
  const [orderId, setOrderId] = useState("");
  const [paymentAttemptId, setPaymentAttemptId] = useState("");
  const navigate = useNavigate();
  const { clearBasket } = useBasket();

  useEffect(() => {
    setPaymentAttemptId(localStorage.getItem("paymentAttemptId"));
  }, [paymentAttemptId]);

  useEffect(() => {
    setOrderId(localStorage.getItem("orderId"));
  }, [orderId]);

  useEffect(() => {
    if ((orderId.length > 0) & (paymentAttemptId.length > 0)) {
      const unsub = fetchPaymentAttempt(paymentAttemptId, (doc) => {
        const { status } = doc.data();

        console.log("status", status);

        switch (status) {
          case PaymentAttemptStatus.SUCCESSFUL:
            clearBasket();
            console.log("SUCCESSFUL");
            navigate(`/checkout/${orderId}/payment-success`);
            break;
          case PaymentAttemptStatus.CANCELLED:
            console.log("CANCELLED");
            navigate(`/checkout/${orderId}/payment-cancelled`);
            break;
          case PaymentAttemptStatus.FAILED:
            console.log("FAILED");
            navigate(`/checkout/${orderId}/payment-failure`);
            break;
          default:
            console.log("PENDING");
        }
      });

      return () => {
        unsub();
      };
    } else {
    }
  }, [paymentAttemptId, orderId]);

  return <LoadingPage />;
}
