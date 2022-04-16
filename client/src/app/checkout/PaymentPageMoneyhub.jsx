import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import LoadingPage from "../../components/LoadingPage";
import { createPaymentAttempt } from "../../utils/services/PaymentsService";
import { saveState } from "../../utils/services/StateService";

export default function PaymentPageMoneyhub({ order }) {
  const location = useLocation();
  const bankId = location.state?.bankId
  const orderId = order.id

  useEffect(() => {
    saveState().then(stateId => {
      createPaymentAttempt(orderId, bankId, stateId).then(res => {
        const { authUrl } = res.data
        window.location.href = authUrl
      })
    })
  }, [bankId, orderId])

  return <LoadingPage message="Sending you to your bank" />
}