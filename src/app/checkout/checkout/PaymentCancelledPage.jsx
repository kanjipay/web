import Back from "../../../assets/icons/Back"
import { Colors } from "../../../components/CircleButton"
import PaymentUnsuccessfulPage from "./PaymentUnsuccessfulPage"

export default function PaymentCancelledPage() {
  return <PaymentUnsuccessfulPage
    Icon={Back}
    iconBackgroundColor={Colors.PRIMARY_LIGHT}
    iconForegroundColor={Colors.PRIMARY}
    title="You cancelled the payment"
    body="Don't worry, you haven't been charged"
  />
}