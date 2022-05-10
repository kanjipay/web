import Tick from "../../../../assets/icons/Tick";
import { Colors } from "../../../../components/CircleButton";
import IconPage from "../../../../components/IconPage";

export default function EmailLinkSentPage() {
  return <IconPage 
    Icon={Tick}
    iconBackgroundColor={Colors.PRIMARY_LIGHT}
    iconForegroundColor={Colors.PRIMARY}
    title="Email link sent"
    body="We sent you an email link for you to sign in. It may take a moment to arrive."
  />
}