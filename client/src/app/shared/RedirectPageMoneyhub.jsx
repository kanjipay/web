import { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import LoadingPage from "../../components/LoadingPage";
import PaymentAttemptStatus from "../../enums/PaymentAttemptStatus";
import { confirmPayment } from "../../utils/services/PaymentsService";
import { parseHashParams } from "../../utils/helpers/parseHashParams";
import { generateRedirectUrl } from "../checkout/redirects";
import PaymentIntentStatus from "../../enums/PaymentIntentStatus";
import { getDoc, onSnapshot } from "firebase/firestore";
import Collection from "../../enums/Collection";

export default function RedirectPageMoneyhub() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { hash } = useLocation()
  const hashParams = parseHashParams(hash);

  const areVariablesInHash = Object.keys(hashParams).length > 0
  const [state, code, error, idToken] = ["state", "code", "error", "id_token"].map(i => hashParams[i] ?? searchParams.get(i));
  const [paymentAttemptId, setPaymentAttemptId] = useState(null)

  // First, initiate the payment
  useEffect(() => {
    const areRightVariablesPresent = !error && state && code && (!areVariablesInHash || idToken)

    if (areRightVariablesPresent && !paymentAttemptId) {
      confirmPayment(code, state, idToken).then(paymentAttemptId => {
        setPaymentAttemptId(paymentAttemptId)
      })
    }
  }, [state, code, error, idToken, areVariablesInHash, paymentAttemptId])

  // Then poll for changes to the payment attempt
  useEffect(() => {
    if (!paymentAttemptId) { return }

    const unsub = onSnapshot(Collection.PAYMENT_ATTEMPT.docRef(paymentAttemptId), doc => {
      const { status, paymentIntentId } = doc.data();
      const basePath = `/checkout/${paymentIntentId}`;

      if (error) {
        if (error === "login_required") {
          navigate(`${basePath}/payment-cancelled`);
        } else {
          navigate(`${basePath}/payment-failure`);
        }
      } else {
        switch (status) {
          case PaymentAttemptStatus.SUCCESSFUL:
            getDoc(Collection.PAYMENT_INTENT.docRef(paymentIntentId)).then(doc => {
              const paymentIntent = { id: doc.id, ...doc.data() }
              const successUrl = generateRedirectUrl(PaymentIntentStatus.SUCCESSFUL, paymentIntent)

              window.location.href = successUrl
            })
            
            break;
          case PaymentAttemptStatus.CANCELLED:
            navigate(`${basePath}/payment-cancelled`);
            break;
          case PaymentAttemptStatus.FAILED:
            navigate(`${basePath}/payment-failure`);
            break;
          default:
        }
      }
      
    })

    return unsub
  }, [paymentAttemptId, navigate, error])

  return <LoadingPage message="Processing your order" />
}