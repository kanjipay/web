import { useEffect, useState } from "react";
import { IdentityManager } from "../../utils/IdentityManager";
import { NetworkManager } from "../../utils/NetworkManager";
import { loadStripe } from '@stripe/stripe-js';
import { useStripe, useElements, Elements, PaymentElement } from '@stripe/react-stripe-js';
import { useParams } from "react-router-dom";
import LoadingPage from "../../components/LoadingPage";
import Spacer from "../../components/Spacer";
import MainButton from "../../components/MainButton";
import IconActionPage from "../../components/IconActionPage";
import Cross from "../../assets/icons/Cross";
import { Colors } from "../../components/CircleButton";
import { AnalyticsManager } from "../../utils/AnalyticsManager";

export default function PaymentPageStripe({ order }) {
  const { orderId } = useParams()
  const [stripeProps, setStripeProps] = useState(null)

  useEffect(() => {
    AnalyticsManager.main.viewPage("StripePayment", { orderId })
  }, [orderId])

  useEffect(() => {
    const deviceId = IdentityManager.main.getDeviceId()

    NetworkManager.post("/payment-attempts/stripe", {
      orderId,
      deviceId
    })
      .then(res => {
        const { clientSecret, stripeAccountId } = res.data
        
        setStripeProps({
          stripe: loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY, {
            stripeAccount: stripeAccountId
          }),
          options: {
            clientSecret
          }
        })
      })

  }, [orderId])

  if (stripeProps) {
    console.log(stripeProps)
    return <Elements {...stripeProps}>
      <StripeCheckoutForm />
    </Elements>
  } else {
    return <LoadingPage />
  }
}

function StripeCheckoutForm() {
  const stripe = useStripe()
  const elements = useElements()

  const [errorData, setErrorData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleError = async (event) => {
    setErrorData(null)
  }

  const handleSubmit = async (event) => {
    setIsLoading(true)

    const redirectUrl = new URL(window.location.href)
    redirectUrl.pathname = "/checkout/stripe-redirect"

    console.log("redirectUrl", redirectUrl.href)

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: redirectUrl.href
      }
    })

    if (result.error) {
      setErrorData({ title: "Something went wrong", description: result.error.message })
    }

    setIsLoading(false)

    return
  }

  if (!stripe || !elements) {
    return <LoadingPage />
  } else if (errorData) {
    return <IconActionPage
      Icon={Cross}
      iconBackgroundColor={Colors.RED_LIGHT}
      iconForegroundColor={Colors.RED}
      title={errorData.title}
      body={errorData.description}
      primaryActionTitle="Go back"
      primaryAction={handleError}
    />
  } else {
    console.log("rerender")
    return <div className="container">
      <div className="content">
        <Spacer y={4} />
        <PaymentElement />
        <Spacer y={2} />
        <MainButton
          title="Submit"
          onClick={handleSubmit}
          isLoading={isLoading}
        />
      </div>
    </div>
  }
}