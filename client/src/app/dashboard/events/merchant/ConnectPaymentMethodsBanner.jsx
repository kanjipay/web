import { useState } from "react";
import ResultBanner, { ResultType } from "../../../../components/ResultBanner";
import Spacer from "../../../../components/Spacer";
import { NetworkManager } from "../../../../utils/NetworkManager";
import StripeStatus from "../../../../enums/StripeStatus";

export default function ConnectPaymentMethodsBanner({ merchant }) {
  const [isRedirectingToStripe, setIsRedirectingToStripe] = useState(false)

  const handleContinueToStripe = async () => {
    setIsRedirectingToStripe(true)

    const res = await NetworkManager.post(`/merchants/m/${merchant.id}/create-stripe-account-link`)

    const { redirectUrl } = res.data

    window.location.href = redirectUrl
  }

  const handleRedirectToCrezco = () => {
    const redirectUrl = new URL(window.location.href)
    redirectUrl.pathname = `/dashboard/o/${merchant.id}/crezco-connected`

    const crezcoRegisteredUrl = new URL(process.env.REACT_APP_CREZCO_REDIRECT)
    crezcoRegisteredUrl.searchParams.append("redirect_uri", redirectUrl.href)

    window.location.href = crezcoRegisteredUrl.href
  }

  return <div style={{ maxWidth: 500 }}>
    {
      !merchant.crezco?.userId && merchant.currency === "GBP" && <div>
        <ResultBanner
          resultType={ResultType.INFO}
          message="Connect with our payment partner, Crezco to reduce fees and get earlier payouts."
          action={handleRedirectToCrezco}
          actionTitle="Connect payments"
        />
        <Spacer y={3} />
      </div>
    }
    {
      merchant.stripe?.status !== StripeStatus.CHARGES_ENABLED && merchant.currency === "EUR" && <div>
        <ResultBanner
          resultType={ResultType.INFO}
          message={
            merchant.stripe?.status === StripeStatus.DETAILS_SUBMITTED ?
              "You've submitted your details to connect to Stripe. They just need to verify you." :
              "Connect directly with Stripe to get lower fees and faster payouts."
              
          }
          action={merchant.stripe?.status !== StripeStatus.DETAILS_SUBMITTED && handleContinueToStripe}
          actionTitle="Connect"
          isLoading={isRedirectingToStripe}
        />
        <Spacer y={3} />
      </div>
    }
  </div>
}