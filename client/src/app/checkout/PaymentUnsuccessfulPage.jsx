import { useNavigate } from "react-router-dom";
import IconActionPage from "../../components/IconActionPage";
import {
  AnalyticsEvent,
  AnalyticsManager,
} from "../../utils/AnalyticsManager";
import { cancelOrder } from "./cancelOrder";

export default function PaymentUnsuccessfulPage({
  Icon,
  iconBackgroundColor,
  iconForegroundColor,
  title,
  body,
  order,
}) {
  const navigate = useNavigate();

  const handleTryAgain = () => {
    AnalyticsManager.main.logEvent(AnalyticsEvent.PRESS_BUTTON, {
      button: "retryPayment",
    });
    navigate("../choose-bank");
  };

  const handleCancelOrder = () => {
    cancelOrder(order, navigate)
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
      secondaryActionTitle="Cancel payment"
      secondaryAction={handleCancelOrder}
    />
  );
}
