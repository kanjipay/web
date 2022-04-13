import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import LoadingPage from "../../../components/LoadingPage";
import { createPaymentAttempt, OpenBankingProvider } from "../../../utils/services/PaymentsService";
import { v4 as uuid } from "uuid";

export default function PaymentPageMoneyhub({ order }) {
  const location = useLocation();
  const bankId = location.state?.bankId
  const orderId = order.id

  useEffect(() => {
    createPaymentAttempt(orderId, OpenBankingProvider.MONEYHUB, { bankId }).then(res => {
      console.log(res.data)
      const { moneyhub, paymentAttemptId } = res.data
      localStorage.setItem("paymentAttemptId", paymentAttemptId)
      window.location.href = moneyhub.authUrl
    })
  }, [bankId, orderId])

  return <LoadingPage message="Processing your order" />
}