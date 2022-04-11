import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import LoadingPage from "../../../components/LoadingPage";
import { createMoneyhubAuthUrl } from "../../../utils/services/PaymentsService";

export default function PaymentPageMoneyhub({ order }) {
  const location = useLocation();
  const bankId = location.state?.bankId
  const orderId = order.id

  useEffect(() => {
    createMoneyhubAuthUrl(orderId, bankId).then(url => {
      // redirect user to url
      console.log(url)
      window.location.href = url
    })
  }, [bankId, orderId])

  return <LoadingPage message="Processing your order" />
}