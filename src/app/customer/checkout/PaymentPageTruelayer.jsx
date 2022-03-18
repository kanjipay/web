import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import LoadingPage from "../../../components/LoadingPage";
import { AnalyticsEvent, AnalyticsManager } from "../../../utils/AnalyticsManager";
import { createPaymentAttempt, OpenBankingProvider } from "../../../utils/services/PaymentsService";

export default function PaymentPageTruelayer() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    createPaymentAttempt(orderId, OpenBankingProvider.TRUELAYER)
      .then((res) => {
        console.log(res.data)
        const { paymentAttemptId } = res.data;
        const { resourceToken, paymentId } = res.data.truelayer

        const appName = process.env.REACT_APP_ENV_NAME === 'PROD' ? "truelayer" : "truelayer-sandbox"
        const redirectUrl = new URL(window.location.href)
        redirectUrl.pathname = "/tl-redirect"
        redirectUrl.search = `?pa=${paymentAttemptId}`
        const truelayerUrl = `https://payment.${appName}.com/payments#payment_id=${paymentId}&resource_token=${resourceToken}&return_uri=${redirectUrl.href}`

        AnalyticsManager.main.logEvent(AnalyticsEvent.CREATE_PAYMENT_ATTEMPT, {
          paymentAttemptId,
        });

        navigate(truelayerUrl);
      })
      .catch((err) => {
        console.log(err);
        navigate("../payment-failure");
      });
  }, [orderId, navigate]);

  return <LoadingPage message="Processing your order" />;
}