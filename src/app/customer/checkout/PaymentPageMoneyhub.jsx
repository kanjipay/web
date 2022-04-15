import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import LoadingPage from "../../../components/LoadingPage";
import { createPaymentAttempt, OpenBankingProvider } from "../../../utils/services/PaymentsService";
import { v4 as uuid } from "uuid";
import { saveState } from "../../../utils/services/StateService";

export default function PaymentPageMoneyhub({ order }) {
  const location = useLocation();
  const bankId = location.state?.bankId
  const orderId = order.id

  useEffect(() => {
    saveState().then(stateId => {
      createPaymentAttempt(orderId, OpenBankingProvider.MONEYHUB, { bankId, stateId }).then(res => {
        const { moneyhub } = res.data
        window.location.href = moneyhub.authUrl
      })
    })
  }, [bankId, orderId])

  return <LoadingPage message="Sending you to your bank" />
}