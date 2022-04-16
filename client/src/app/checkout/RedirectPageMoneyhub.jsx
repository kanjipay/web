import { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import LoadingPage from "../../components/LoadingPage";
import PaymentAttemptStatus from "../../enums/PaymentAttemptStatus";
import { fetchPaymentAttempt, swapCode } from "../../utils/services/PaymentsService";
import { restoreState } from "../../utils/services/StateService";
import { parseHashParams } from "../../utils/helpers/parseHashParams";
import useBasket from "../menu/basket/useBasket";

export default function RedirectPageMoneyhub() {
  const navigate = useNavigate();
  const { clearBasket, loadBasket } = useBasket();
  const [searchParams] = useSearchParams();
  const { hash } = useLocation()
  const hashParams = parseHashParams(hash);

  const areVariablesInHash = Object.keys(hashParams).length > 0
  const [hasSwappedCode, setHasSwappedCode] = useState(false)

  const [state, code, error, idToken] = ["state", "code", "error", "id_token"].map(i => hashParams[i] ?? searchParams.get(i));
  console.log("state: ", state)
  const [paymentAttemptId, stateId] = state.split(".")

  useEffect(() => {
    const areRightVariablesPresent = !error && state && code && (!areVariablesInHash || idToken)

    if (areRightVariablesPresent) {
      if (hasSwappedCode) { return }

      restoreState(stateId).then(wasStateRestored => {
        swapCode(code, state, idToken, paymentAttemptId).then(res => {
          setHasSwappedCode(true)
        }).catch(err => {
          console.log(err)
        })
      })
    }

    return () => {
      loadBasket()
    }
  }, [state, code, error, idToken, stateId, areVariablesInHash, hasSwappedCode, loadBasket, paymentAttemptId])

  useEffect(() => {
    const unsub = fetchPaymentAttempt(paymentAttemptId, doc => {
      const { status, orderId } = doc.data();
      const basePath = `/checkout/${orderId}`;

      if (error) {
        if (error === "login_required") {
          navigate(`${basePath}/payment-cancelled`);
        } else {
          navigate(`${basePath}/payment-failure`);
        }
      } else {
        switch (status) {
          case PaymentAttemptStatus.SUCCESSFUL:
            clearBasket();
            navigate(`${basePath}/payment-success`);
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
  }, [paymentAttemptId, navigate, clearBasket, error])

  return <LoadingPage message="Processing your order" />
}