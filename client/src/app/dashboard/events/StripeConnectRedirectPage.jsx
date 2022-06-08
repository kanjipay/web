import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Tick from "../../../assets/icons/Tick";
import { Colors } from "../../../components/CircleButton";
import IconActionPage from "../../../components/IconActionPage";
import LoadingPage from "../../../components/LoadingPage";
import { NetworkManager } from "../../../utils/NetworkManager";
import ConnectStripePage from "./ConnectStripePage";

export default function StripeConnectRedirectPage() {
  const [areChargesEnabled, setAreChargesEnabled] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()
  const { merchantId } = useParams()

  console.log("Stripe connect")

  useEffect(() => {
    NetworkManager.put(`/merchants/m/${merchantId}/update-stripe-status`).then(({ areChargesEnabled }) => {
      if (areChargesEnabled) {

      } else {

      }
    })
  }, [merchantId])

  if (isLoading) {
    return <LoadingPage />
  } else if (areChargesEnabled) {
    const handleContinue = () => {
      navigate(`/dashboard/o/${merchantId}/events`)
    }

    return <IconActionPage
      Icon={Tick}
      iconBackgroundColor={Colors.OFF_WHITE_LIGHT}
      iconForegroundColor={Colors.BLACK}
      title="Card payments enabled"
      body="You're now all set up to receive card payments!"
      primaryAction={handleContinue}
      primaryActionTitle="Continue"
    />
  } else {
    return <ConnectStripePage
      title="Stripe onboarding incomplete"
      body="You haven't quite completed your Stripe onboarding."
    />
  }
}