import { getDoc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import LoadingPage from "../../components/LoadingPage";
import Collection from "../../enums/Collection";
import PaymentAttemptStatus from "../../enums/PaymentAttemptStatus";
import PaymentIntentStatus from "../../enums/PaymentIntentStatus";
import { generateRedirectUrl } from "./redirects";

export default function RedirectPageCrezco() {
  const [searchParams] = useSearchParams()
  const paymentAttemptId = searchParams.get("paymentAttemptId")
  const navigate = useNavigate()
  const [shouldRedirectToSuccessUrl, setShouldRedirectToSuccessUrl] = useState(false)
  const [paymentIntentId, setPaymentIntentId] = useState(null)

  useEffect(() => {
    const unsub = onSnapshot(Collection.PAYMENT_ATTEMPT.docRef(paymentAttemptId), doc => {
      const { status, paymentIntentId } = doc.data()

      switch (status) {
        case PaymentAttemptStatus.SUCCESSFUL:
          setShouldRedirectToSuccessUrl(true)
          setPaymentIntentId(paymentIntentId)
          break;
        case PaymentAttemptStatus.FAILED:
          navigate(`/checkout/pi/${paymentIntentId}/payment-failure`);
          break;
        default:
      }
    })

    return () => {
      unsub()
    }
  }, [paymentAttemptId, navigate])

  useState(() => {
    if (!shouldRedirectToSuccessUrl || !paymentIntentId) { return }

    setShouldRedirectToSuccessUrl(false)

    getDoc(Collection.PAYMENT_INTENT.docRef(paymentIntentId)).then(doc => {
      const paymentIntent = { id: doc.id, ...doc.data() }
      const redirectUrl = generateRedirectUrl(PaymentIntentStatus.SUCCESSFUL, paymentIntent)
      window.location.href = redirectUrl
    })
  }, [shouldRedirectToSuccessUrl])

  return <LoadingPage />
}