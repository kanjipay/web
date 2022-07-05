import { updateDoc } from "firebase/firestore"
import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import IconActionPage from "../../../components/IconActionPage"
import LoadingPage from "../../../components/LoadingPage"
import Collection from "../../../enums/Collection"
import Forward from "../../../assets/icons/Forward"
import { NetworkManager } from "../../../utils/NetworkManager"

export default function ConnectStripePage({ title, body }) {
  const { merchantId } = useParams()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)

  const handleSkipStripe = () => {
    setIsLoading(true)

    updateDoc(Collection.MERCHANT.docRef(merchantId), {
      "stripe.wasSkipped": true,
    }).then(() => {
      navigate(`/dashboard/o/${merchantId}`)
    })
  }

  const handleContinueToStripe = async () => {
    setIsLoading(true)

    const res = await NetworkManager.post(
      `/merchants/m/${merchantId}/create-stripe-account-link`
    )

    const { redirectUrl } = res.data

    window.location.href = redirectUrl
  }

  return isLoading ? (
    <LoadingPage />
  ) : (
    <IconActionPage
      Icon={Forward}
      title={title ?? "Connect Stripe"}
      body={
        body ??
        "You can connect with our partner Stripe to enable card payments."
      }
      name="connect-stripe"
      primaryActionTitle="Continue to Stripe"
      primaryAction={handleContinueToStripe}
      secondaryActionTitle="Leave for later"
      secondaryAction={handleSkipStripe}
    />
  )
}
