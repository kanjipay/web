import Cross from "../../../assets/icons/Cross";
import { Colors } from "../../../components/CircleButton";
import { PageName } from "../../../utils/AnalyticsManager";
import PaymentUnsuccessfulPage from "./PaymentUnsuccessfulPage";

export default function PaymentFailurePage() {
  return (
    <PaymentUnsuccessfulPage
      Icon={Cross}
      iconBackgroundColor={Colors.RED_LIGHT}
      iconForegroundColor={Colors.RED}
      title="Your payment failed"
      body="Don't worry, you haven't been charged"
      pageName={PageName.PAYMENT_FAILURE}
    />
  );
}
