import { useParams } from "react-router-dom"
import Forward from "../../../assets/icons/Forward"
import { Colors } from "../../../enums/Colors"
import IconActionPage from "../../../components/IconActionPage"

export default function ConnectCrezcoPage({ user }) {
  const { merchantId } = useParams()

  const handleVerifyDetails = () => {
    const redirectUrl = new URL(window.location.href)
    redirectUrl.pathname = `/dashboard/o/${merchantId}/crezco-connected`

    const crezcoRegisteredUrl = new URL(process.env.REACT_APP_CREZCO_REDIRECT)
    crezcoRegisteredUrl.searchParams.append("redirect_uri", redirectUrl.href)

    window.location.href = crezcoRegisteredUrl.href
  }

  return (
    <IconActionPage
      Icon={Forward}
      iconBackgroundColor={Colors.OFF_WHITE_LIGHT}
      iconForegroundColor={Colors.BLACK}
      title={`One more step, ${user.firstName}`}
      name="connect-crezco"
      body="Before your organisation can accept payments, you'll need to verify you own the account you've provided. You can do this by using our trusted partner Crezco."
      primaryAction={handleVerifyDetails}
      primaryActionTitle="Continue to Crezco"
    />
  )
}
