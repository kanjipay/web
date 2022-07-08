import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import Tick from "../../../assets/icons/Tick"
import IconActionPage from "../../../components/IconActionPage"
import LoadingPage from "../../../components/LoadingPage"
import { Colors } from "../../../enums/Colors"
import StripeStatus from "../../../enums/StripeStatus"
import { NetworkManager } from "../../../utils/NetworkManager"

export default function StripeConnectRedirectPage() {
  const { merchantId } = useParams()
  const [stripeStatus, setStripeStatus] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    NetworkManager.put(`/merchants/m/${merchantId}/update-stripe-status`).then(
      (res) => {
        const { stripeStatus } = res.data
        setStripeStatus(stripeStatus)
      }
    )
  }, [merchantId])

  if (!stripeStatus) {
    return <LoadingPage />
  } else
    switch (stripeStatus) {
      case StripeStatus.CHARGES_ENABLED:
        return <IconActionPage
          Icon={Tick}
          iconBackgroundColor={Colors.OFF_WHITE_LIGHT}
          iconForegroundColor={Colors.BLACK}
          title="Card payments enabled"
          name="stripe-connected"
          body="You're now all set up to receive card payments!"
          primaryAction={() =>
            navigate(`/dashboard/o/${merchantId}/events`)
          }
          primaryActionTitle="Continue"
        />
      case StripeStatus.DETAILS_SUBMITTED:
        return <IconActionPage
          Icon={Tick}
          iconBackgroundColor={Colors.OFF_WHITE_LIGHT}
          iconForegroundColor={Colors.BLACK}
          title="Details submitted"
          name="stripe-connected"
          body="Stripe needs to verify some of your details before you can receive card payments. This normally only takes a few days, and they'll send you an email once it's done."
          primaryAction={() =>
            navigate(`/dashboard/o/${merchantId}/events`)
          }
          primaryActionTitle="Continue"
        />
      case StripeStatus.DETAILS_NOT_SUBMITTED:
        return <IconActionPage
          Icon={Tick}
          iconBackgroundColor={Colors.OFF_WHITE_LIGHT}
          iconForegroundColor={Colors.BLACK}
          title="Stripe onboarding incomplete"
          name="stripe-connected"
          body="You haven't filled in all the details needed for your Stripe onboarding. Any details you have filled in are saved."
          primaryAction={() =>
            navigate(`/dashboard/o/${merchantId}/events`)
          }
          primaryActionTitle="Continue"
        />
      default:
        return <LoadingPage />
    }
}
