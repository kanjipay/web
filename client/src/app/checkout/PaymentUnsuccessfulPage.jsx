import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import IconActionPage from "../../components/IconActionPage";
import { setOrderStatus } from "../../utils/services/OrdersService";
import OrderStatus from "../../enums/OrderStatus";
import {
  AnalyticsEvent,
  AnalyticsManager,
  viewPage,
} from "../../utils/AnalyticsManager";
import { cancelPaymentIntent } from "./redirects";

export default function PaymentUnsuccessfulPage({
  Icon,
  iconBackgroundColor,
  iconForegroundColor,
  title,
  body,
  pageName,
  paymentIntent,
}) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleTryAgain = () => {
    AnalyticsManager.main.logEvent(AnalyticsEvent.PRESS_BUTTON, {
      button: "retryPayment",
    });
    navigate("../payment");
  };

  const handleCancelOrder = () => {
    setIsLoading(true);

    AnalyticsManager.main.logEvent(AnalyticsEvent.PRESS_BUTTON, {
      button: "cancelPaymentIntent",
    });

    cancelPaymentIntent(paymentIntent).then(redirectUrl => {
      setIsLoading(false)
      window.location.href = redirectUrl
    })
  };

  return (
    <IconActionPage
      Icon={Icon}
      iconBackgroundColor={iconBackgroundColor}
      iconForegroundColor={iconForegroundColor}
      title={title}
      body={body}
      primaryActionTitle="Try again"
      primaryAction={handleTryAgain}
      secondaryActionTitle="Cancel order"
      secondaryAction={handleCancelOrder}
      secondaryIsLoading={isLoading}
    />
  );
}