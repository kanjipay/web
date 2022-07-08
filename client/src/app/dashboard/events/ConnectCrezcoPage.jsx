import { useParams } from "react-router-dom"
import Forward from "../../../assets/icons/Forward"
import { Colors } from "../../../enums/Colors"
import IconActionPage from "../../../components/IconActionPage"
import { redirectToCrezco } from "./redirectToCrezco"

export default function ConnectCrezcoPage({ user }) {
  const { merchantId } = useParams()

  return (
    <IconActionPage
      Icon={Forward}
      iconBackgroundColor={Colors.OFF_WHITE_LIGHT}
      iconForegroundColor={Colors.BLACK}
      title="Connect payments"
      name="connect-crezco"
      body="Before your organisation can accept payments, you'll need to connect with our payments partner, Crezco."
      primaryAction={() => redirectToCrezco(merchantId)}
      primaryActionTitle="Continue to Crezco"
    />
  )
}
