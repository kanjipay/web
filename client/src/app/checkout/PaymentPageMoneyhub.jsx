import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import LoadingPage from "../../components/LoadingPage";
import { createPaymentAttempt } from "../../utils/services/PaymentsService";

export default function PaymentPageMoneyhub({ paymentIntent }) {
  const location = useLocation();
  const bankId = location.state?.bankId
  const paymentIntentId = paymentIntent.id

  useEffect(() => {
    createPaymentAttempt(paymentIntentId, bankId).then(authUrl => {
      window.location.href = authUrl
    })
  }, [bankId, paymentIntentId])

  return <LoadingPage message="Sending you to your bank" />
}