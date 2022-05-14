import Back from "../../assets/icons/Back";
import { PageName } from "../../utils/AnalyticsManager";
import PaymentUnsuccessfulPage from "./PaymentUnsuccessfulPage";

export default function PaymentCancelledPage({ paymentIntent }) {
  return (
    <PaymentUnsuccessfulPage
      Icon={Back}
      title="You cancelled the payment"
      body="Don't worry, you haven't been charged"
      pageName={PageName.PAYMENT_CANCELLED}
      paymentIntent={paymentIntent}
    />
  );
}
