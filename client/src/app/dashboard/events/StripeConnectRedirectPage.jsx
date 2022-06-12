import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import LoadingPage from "../../../components/LoadingPage";
import StripeStatus from "../../../enums/StripeStatus";
import { NetworkManager } from "../../../utils/NetworkManager";
import ConnectStripePage from "./ConnectStripePage";

export default function StripeConnectRedirectPage() {
  const { merchantId } = useParams()
  const [stripeStatus, setStripeStatus] = useState(null)

  useEffect(() => {
    NetworkManager.put(`/merchants/m/${merchantId}/update-stripe-status`).then(res => {
      const { stripeStatus } = res.data
      setStripeStatus(stripeStatus)
    })
  }, [merchantId])

  if (!stripeStatus) {
    return <LoadingPage />
  } else switch (stripeStatus) {
    case StripeStatus.DETAILS_NOT_SUBMITTED:
      return <ConnectStripePage
        title="Stripe onboarding incomplete"
        body="You haven't quite completed your Stripe onboarding."
      />
    default:
      return <LoadingPage />
  }
}