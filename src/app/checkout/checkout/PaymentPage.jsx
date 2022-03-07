import { useEffect, useState } from "react"
import LoadingPage from "../../../components/LoadingPage"
import { usePlaidLink } from 'react-plaid-link';
import { useNavigate, useParams } from "react-router-dom";
import useBasket from "../basket/useBasket";
import { setOrderStatus } from "../../../utils/services/OrdersService";
import OrderStatus from "./OrderStatus";
import { createPaymentAttempt, setPaymentAttemptStatus } from "../../../utils/services/PaymentsService";
import PaymentAttemptStatus from "./PaymentAttemptStatus";

export default function PaymentPage() {
  const [paymentAttemptId, setPaymentAttemptId] = useState(null)
  const [linkToken, setLinkToken] = useState(null)
  const { orderId } = useParams()
  const navigate = useNavigate()
  const { clearBasket } = useBasket()

  const onSuccess = (publicToken, metadata) => {
    console.log("onSuccess", publicToken, metadata)

    try {
      Promise.all([
        setOrderStatus(orderId, OrderStatus.PAID),
        setPaymentAttemptStatus(paymentAttemptId, PaymentAttemptStatus.SUCCESSFUL)
      ]).then(res => {
        console.log(res)
        clearBasket()
        navigate('../payment-success')
      })
    } catch (err) {
      console.log(err)
    }
  }

  const onExit = (err, metadata) => {
    console.log("onExit", err, metadata)

    if (err) {
      setPaymentAttemptStatus(paymentAttemptId, PaymentAttemptStatus.FAILED)
        .then(doc => {
          navigate('../payment-failure')
        })
        .catch(err => {
          console.log(err)
        })
    } else {
      setPaymentAttemptStatus(paymentAttemptId, PaymentAttemptStatus.CANCELLED)
        .then(doc => {
          navigate('../payment-cancelled')
        })
        .catch(err => {
          console.log(err)
        })
    }
  }

  const onEvent = (eventName, metadata) => {
    console.log("onEvent", eventName, metadata)
  }

  const { open, exit, ready } = usePlaidLink({
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
  }, [ready, paymentAttemptId])

  useEffect(() => {
    createPaymentAttempt(orderId)
      .then(res => {
        console.log(res)
        setPaymentAttemptId(res.data.payment_attempt_id)
        setLinkToken(res.data.link_id)
      })
      .catch(err => {
        console.log(err)
        navigate('../payment-failure')
      })
  }, [])

  return <LoadingPage message="Processing your order" />
}