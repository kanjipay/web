import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import LoadingPage from "../../../components/LoadingPage";
import PaymentAttemptStatus from "../../../enums/PaymentAttemptStatus";
import {
  fetchPaymentAttempt,
  fetchProviderPaymentAttempt,
  OpenBankingProvider,
} from "../../../utils/services/PaymentsService";
import useBasket from "../basket/useBasket";

export default function RedirectPageTruelayer() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { clearBasket } = useBasket();

  const paymentId = searchParams.get("payment_id");

  if (!paymentId) {
    console.log("error no payment id");
  }

  useEffect(() => {
    console.log("useEffect: ", paymentId);

    if (paymentId) {
      let unsub;

      fetchProviderPaymentAttempt(paymentId, OpenBankingProvider.TRUELAYER)
        .then((paymentAttempt) => {
          console.log(paymentAttempt);
          unsub = fetchPaymentAttempt(paymentAttempt.id, (doc) => {
            const { status, orderId } = doc.data();

            console.log(status);

            const basePath = `/checkout/${orderId}`;

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
        })
        .catch((err) => {});

      return () => {
        if (unsub) {
          unsub();
        }
      };
    }
  }, [paymentId, clearBasket, navigate]);

  return <LoadingPage />;
}
