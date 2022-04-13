import { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import LoadingPage from "../../../components/LoadingPage";
import PaymentAttemptStatus from "../../../enums/PaymentAttemptStatus";
import { fetchPaymentAttempt, swapCode } from "../../../utils/services/PaymentsService";
import useBasket from "../basket/useBasket";

function parseHashParams(hash) {
  if (hash === "") { return {} }

  const hashParams = hash
    .replace("#", "")
    .split("&")
    .reduce((params, paramString) => {
      const [key, value] = paramString.split("=")
      params[key] = value

      return params
    }, {})

  return hashParams
}

export default function RedirectPageMoneyhub() {
  const navigate = useNavigate();
  const { clearBasket } = useBasket();
  const [searchParams] = useSearchParams();
  const { hash } = useLocation()

  const isLocal = false//process.env.REACT_APP_IS_LOCAL_ENV === "TRUE"

  console.log(process.env.REACT_APP_IS_LOCAL)
  console.log("isLocal: ", isLocal)

  let state, code, idToken, errorName

  if (isLocal) {
    [state, code, errorName] = ["state", "code", "error"].map(i => searchParams.get(i));
  } else {
    const hashParams = parseHashParams(hash);
    console.log(hashParams);
    [state, code, idToken, errorName] = ["state", "code", "id_token", "error"].map(i => hashParams[i]);
  }

  console.log("state: ", state)
  console.log("code: ", code)
  console.log("idToken: ", idToken)
  console.log("errorName: ", errorName)

  useEffect(() => {
    console.log("use effect for calling swap code")
    const areRightVariablesPresent = !errorName && state && code && (isLocal || idToken)
    if (areRightVariablesPresent) {
      console.log("right variables are present")
      const nonce = state
      swapCode(code, state, idToken, nonce).then(res => {

      })
    }
  }, [code, state, idToken, errorName, isLocal])

  useEffect(() => {
    const paymentAttemptId = state

    const unsub = fetchPaymentAttempt(paymentAttemptId, doc => {
      const { status, orderId } = doc.data();

      console.log(status);

      const basePath = `/checkout/o/${orderId}`;

      console.log(basePath)

      switch (status) {
        case PaymentAttemptStatus.SUCCESSFUL:
          clearBasket();
          console.log(`${basePath}/payment-success`)
          // navigate(`${basePath}/payment-success`);
          navigate(`/checkout/o/${orderId}/payment-success`)
          break;
        case PaymentAttemptStatus.CANCELLED:
          navigate(`${basePath}/payment-cancelled`);
          break;
        case PaymentAttemptStatus.FAILED:
          navigate(`${basePath}/payment-failure`);
          break;
        default:
      }
    })

    return unsub
  }, [state, navigate, clearBasket])

  if (errorName) {
    switch (errorName) {
      case "login_required":
        return <div>Login required</div>
      default:
        return <div>Some error</div>
    }
  } else {
    return <LoadingPage message="Processing your order" />
  }
}