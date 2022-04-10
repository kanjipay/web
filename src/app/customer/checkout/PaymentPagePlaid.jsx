import { useEffect, useState } from "react";
import LoadingPage from "../../../components/LoadingPage";
import { usePlaidLink, PlaidLinkOptions } from "react-plaid-link";
import { useNavigate, useParams } from "react-router-dom";
import useBasket from "../basket/useBasket";
import {
  createPaymentAttempt,
  fetchPaymentAttempt,
  OpenBankingProvider,
} from "../../../utils/services/PaymentsService";
import PaymentAttemptStatus from "../../../enums/PaymentAttemptStatus";
import {
  AnalyticsEvent,
  AnalyticsManager,
} from "../../../utils/AnalyticsManager";
import { setOrderStatus } from "../../../utils/services/OrdersService";

class PlaidEventName {
  static OPEN = "OPEN"; // Open the dialog
  static ERROR = "ERROR"; // Recoverable error in link flow
  static EXIT = "EXIT"; // user exited without completing Link flow and called onExit
  static CLOSE_OAUTH = "CLOSE_OAUTH"; // User closed window without completing or firing onExit
  static FAIL_OAUTH = "FAIL_OAUTH";
  static SELECT_INSTITUTION = "SELECT_INSTITUTION"; // user selected an institution
  static MATCHED_SELECT_INSTITUTION = "MATCHED_SELECT_INSTITUTION"; // Existing user selected institution suggested to them
  static HANDOFF = "HANDOFF"; // Called after successfully going through Link
}

export default function PaymentPagePlaid({ order, updateStatus }) {
  const [paymentAttemptId, setPaymentAttemptId] = useState(null);
  const [linkToken, setLinkToken] = useState(null);
  console.log('Order', order);
  const orderId = order.id;
  const navigate = useNavigate();
  const { clearBasket } = useBasket();
  const isOAuthRedirect = window.location.href.includes("?oauth_state_id=");
  const isLocalEnvironment =
    process.env.REACT_APP_ENV_NAME == "LOCAL" ? true : false;

  const onSuccess = (_publicToken, _metadata) => {
    console.log('Success!')
    updateStatus('PAID');
    clearBasket(); 
    navigate("../payment-success");
  };

  const onExit = (err, metadata) => {
    console.log("onExit", err, metadata);
  };

  const onEvent = (eventName, metadata) => {
    const mercadoEventName = AnalyticsEvent.RECEIVE_PLAID_EVENT;
    const defaultDataWithoutInstit = {
      eventName,
      plaidRequestId: metadata.request_id,
    };
    const defaultData = {
      ...defaultDataWithoutInstit,
      institution: metadata.institution_name,
    };

    const dataWithErrors = {
      ...defaultData,
      errorType: metadata.error_type,
      errorCode: metadata.error_code,
      errorMessage: metadata.error_message,
    };

    switch (eventName) {
      case PlaidEventName.OPEN:
        AnalyticsManager.main.logEvent(
          mercadoEventName,
          defaultDataWithoutInstit
        );
        break;
      case PlaidEventName.SELECT_INSTITUTION:
        AnalyticsManager.main.logEvent(mercadoEventName, defaultData);
        break;
      case PlaidEventName.MATCHED_SELECT_INSTITUTION:
        AnalyticsManager.main.logEvent(mercadoEventName, defaultData);
        break;
      case PlaidEventName.FAIL_OAUTH:
        AnalyticsManager.main.logEvent(mercadoEventName, defaultData);
        break;
      case PlaidEventName.CLOSE_OAUTH:
        AnalyticsManager.main.logEvent(mercadoEventName, defaultData);
        break;
      case PlaidEventName.EXIT:
        // Exit status is the point at which user exited Link
        AnalyticsManager.main.logEvent(mercadoEventName, {
          ...dataWithErrors,
          exitStatus: metadata.exit_status,
        });
        break;
      case PlaidEventName.ERROR:
        AnalyticsManager.main.logEvent(mercadoEventName, dataWithErrors);
        break;
      case PlaidEventName.HANDOFF:
        AnalyticsManager.main.logEvent(mercadoEventName, defaultData);
        break;
      default:
    }
  };

  const config = {
    // token must be the same token used for the first initialization of Link
    onSuccess,
    onEvent,
    onExit,
    token: linkToken,
  };
  if (isOAuthRedirect) {
    // receivedRedirectUri must include the query params
    config.receivedRedirectUri = window.location.href;
  }

  const { open, ready } = usePlaidLink(config);

  useEffect(() => {
    if (ready && paymentAttemptId) {
      open();
    }
  }, [ready, paymentAttemptId, open]);

  useEffect(() => {
    if (paymentAttemptId) {
      const unsub = fetchPaymentAttempt(paymentAttemptId, (doc) => {
        const { status } = doc.data();

        switch (status) {
          // case PaymentAttemptStatus.SUCCESSFUL:
          //   clearBasket();
          //   navigate("../payment-success");
          //   break;
          case PaymentAttemptStatus.CANCELLED:
            navigate("../payment-cancelled");
            break;
          case PaymentAttemptStatus.FAILED:
            navigate("../payment-failure");
            break;
          default:
        }
      });

      return () => {
        unsub();
      };
    }
  }, [paymentAttemptId, clearBasket, navigate]);

  useEffect(() => {
    if (isOAuthRedirect) {
      setLinkToken(localStorage.getItem("linkToken"));
      setPaymentAttemptId(localStorage.getItem("paymentAttemptId"));
    } else {
      updateStatus('');
      createPaymentAttempt(
        orderId,
        OpenBankingProvider.PLAID,
        isLocalEnvironment
      )
        .then((res) => {
          console.log(res.data);
          const { paymentAttemptId } = res.data;
          const linkToken = res.data.plaid.linkToken;
          AnalyticsManager.main.logEvent(
            AnalyticsEvent.CREATE_PAYMENT_ATTEMPT,
            {
              paymentAttemptId,
            }
          );
          setPaymentAttemptId(paymentAttemptId);
          localStorage.setItem("linkToken", linkToken);
          localStorage.setItem("paymentAttemptId", paymentAttemptId);
          setLinkToken(linkToken);
        })
        .catch((err) => {
          console.log(err);
          navigate("../payment-failure");
        });
    }
  }, [orderId, navigate]);

  return <LoadingPage message="Processing your order" />;
}
