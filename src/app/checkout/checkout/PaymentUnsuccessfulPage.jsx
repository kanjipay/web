import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import IconActionPage from "../../../components/IconActionPage";
import { setOrderStatus } from "../../../utils/services/OrdersService";
import OrderStatus from "../../../enums/OrderStatus";

export default function PaymentUnsuccessfulPage({
  Icon,
  iconBackgroundColor,
  iconForegroundColor,
  title,
  body,
}) {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const [isLoading, setIsLoading] = useState(false);

  function handleCancelOrder() {
    setIsLoading(true);

    setOrderStatus(orderId, OrderStatus.ABANDONED)
      .then((doc) => {
        setIsLoading(false);
        navigate("../..");
      })
      .catch((err) => {
        setIsLoading(false);
        console.log(err);
      });
  }

  return (
    <IconActionPage
      Icon={Icon}
      iconBackgroundColor={iconBackgroundColor}
      iconForegroundColor={iconForegroundColor}
      title={title}
      body={body}
      primaryActionTitle="Try again"
      primaryAction={() => navigate("../payment")}
      secondaryActionTitle="Cancel order"
      secondaryAction={() => handleCancelOrder()}
      secondaryIsLoading={isLoading}
    />
  );
}
