import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import PaymentAttemptStatus from "../../../enums/PaymentAttemptStatus";
import { fetchPaymentAttempt } from "../../../utils/services/PaymentsService";
import useBasket from "../basket/useBasket";

export default function RedirectPageTruelayer() {
  const [searchParams,] = useSearchParams();
  const navigate = useNavigate()
  const { clearBasket } = useBasket()

  const paymentAttemptId = searchParams.get("pa")

  if (!paymentAttemptId) {
    console.log("error no payment id")
  }

  useEffect(() => {
    if (paymentAttemptId) {
      const unsub = fetchPaymentAttempt(paymentAttemptId, (doc) => {
        const { status, orderId, merchantId } = doc.data();

        const basePath = `/menu/${merchantId}/checkout/${orderId}`

        switch (status) {
          case PaymentAttemptStatus.SUCCESSFUL:
            clearBasket();
            navigate(`${basePath}/payment-success`);
            break;
          case PaymentAttemptStatus.CANCELLED:
            navigate(`${basePath}/payment-cancelled`);
            break;
          case PaymentAttemptStatus.FAILED:
            navigate(`${basePath}/payment-failure`);
            break;
          default:
        }
      });

      return () => {
        unsub();
      };
    }
  }, [paymentAttemptId, clearBasket, navigate]);
}