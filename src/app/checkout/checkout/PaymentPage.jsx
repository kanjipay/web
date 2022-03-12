import { useEffect, useState } from "react"
import LoadingPage from "../../../components/LoadingPage"
import { usePlaidLink } from 'react-plaid-link';
import { useNavigate, useParams } from "react-router-dom";
import useBasket from "../basket/useBasket";
import { setOrderStatus } from "../../../utils/services/OrdersService";
import OrderStatus from "../../../enums/OrderStatus";
import { createPaymentAttempt, setPaymentAttemptStatus } from "../../../utils/services/PaymentsService";
import PaymentAttemptStatus from "../../../enums/PaymentAttemptStatus"
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import Collection from "../../../enums/Collection";

export default function PaymentPage() {
  const [paymentAttemptId, setPaymentAttemptId] = useState(null)
  const [linkToken, setLinkToken] = useState(null)
  const { orderId } = useParams()
  const navigate = useNavigate()
  const { clearBasket } = useBasket()

  const onSuccess = (publicToken, metadata) => {
    console.log("onSuccess", publicToken, metadata)
  }

  const onExit = (err, metadata) => {
    console.log("onExit", err, metadata)
  }

  const onEvent = (eventName, metadata) => {
    console.log("onEvent", eventName, metadata)
  }

  const { open, ready } = usePlaidLink({
    onSuccess,
    onExit,
    onEvent,
    token: linkToken,
    //required for OAuth; if not using OAuth, set to null or omit:
    // receivedRedirectUri: window.location.href,
  })

  useEffect(() => {
    if (ready && paymentAttemptId) {
      open()
    }
  }, [ready, paymentAttemptId, open])

  useEffect(() => {
    if (paymentAttemptId) {
      const unsub = onSnapshot(Collection.PAYMENT_ATTEMPT.docRef(paymentAttemptId), doc => {
        const { status } = doc.data()

        switch (status) {
          case PaymentAttemptStatus.SUCCESSFUL:
            clearBasket()
            navigate('../payment-success')
            break;
          case PaymentAttemptStatus.CANCELLED:
            navigate('../payment-cancelled')
            break;
          case PaymentAttemptStatus.FAILED:
            navigate('../payment-failure')
            break;
          default:
            
        }
      })

      return () => {
        unsub()
      }
    }
  }, [paymentAttemptId, clearBasket, navigate])

  useEffect(() => {
    createPaymentAttempt(orderId)
      .then(res => {
        const { link_token, payment_attempt_id } = res
        setPaymentAttemptId(payment_attempt_id)
        setLinkToken(link_token)
      })
      .catch(err => {
        console.log(err)
        navigate('../payment-failure')
      })
  }, [orderId, navigate])

  return <LoadingPage message="Processing your order" />
}