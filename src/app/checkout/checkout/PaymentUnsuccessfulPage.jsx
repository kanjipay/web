import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import IconActionPage from "../../../components/IconActionPage";
import { setOrderStatus } from "../../../utils/services/OrdersService";
import OrderStatus from "../../../enums/OrderStatus";
import {
  AnalyticsEvent,
  AnalyticsManager,
  viewPage,
} from "../../../utils/AnalyticsManager";

export default function PaymentUnsuccessfulPage({
  Icon,
  iconBackgroundColor,
  iconForegroundColor,
  title,
  body,
  pageName,
}) {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    viewPage(pageName, { orderId });
  }, [orderId, pageName]);

  const handleTryAgain = () => {
    AnalyticsManager.main.logEvent(AnalyticsEvent.PRESS_BUTTON, {
      button: "retryOrderPayment",
    });
    navigate("../payment");
  };

  const handleCancelOrder = () => {
    setIsLoading(true);

    AnalyticsManager.main.logEvent(AnalyticsEvent.PRESS_BUTTON, {
      button: "cancelOrder",
    });

    setOrderStatus(orderId, OrderStatus.ABANDONED)
      .then((doc) => {
        setIsLoading(false);
        AnalyticsManager.main.logEvent(AnalyticsEvent.ABANDON_ORDER, {
          orderId,
        });
        navigate("../..");
      })
      .catch((err) => {
        setIsLoading(false);
        console.log(err);
      });
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
