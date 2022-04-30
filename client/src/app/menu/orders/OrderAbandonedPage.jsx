import { useNavigate } from "react-router-dom";
import Back from "../../../assets/icons/Back";
import { Colors } from "../../../components/CircleButton";
import IconActionPage from "../../../components/IconActionPage";

export default function OrderCancelledPage({ order }) {
  const navigate = useNavigate()
  
  const { merchantId } = order;

  const handleReturnToBasket = () => {
    navigate(`/menu/${merchantId}/basket`)
  }

  return <div>
    <IconActionPage
      Icon={Back}
      iconBackgroundColor={Colors.PRIMARY_LIGHT}
      iconForegroundColor={Colors.PRIMARY}
      title={"You cancelled the payment"}
      body={"We've left your items in your basket."}
      primaryActionTitle="Return to basket"
      primaryAction={handleReturnToBasket}
    />
  </div>
}