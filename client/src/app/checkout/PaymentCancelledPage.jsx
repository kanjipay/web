import Back from "../../assets/icons/Back";
import { Colors } from "../../components/CircleButton";
import { PageName } from "../../utils/AnalyticsManager";
import PaymentUnsuccessfulPage from "./PaymentUnsuccessfulPage";

export default function PaymentCancelledPage({ order }) {
  return (
    <PaymentUnsuccessfulPage
      Icon={Back}
      iconBackgroundColor={Colors.PRIMARY_LIGHT}
      iconForegroundColor={Colors.PRIMARY}
      title="You cancelled the payment"
      body="Don't worry, you haven't been charged"
      pageName={PageName.PAYMENT_CANCELLED}
      order={order}
    />
  );
}
