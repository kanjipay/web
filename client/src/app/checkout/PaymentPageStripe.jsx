import { useEffect, useState } from "react"
import { IdentityManager } from "../../utils/IdentityManager"
import { NetworkManager } from "../../utils/NetworkManager"
import { loadStripe } from "@stripe/stripe-js"
import {
  useStripe,
  useElements,
  Elements,
  PaymentElement,
} from "@stripe/react-stripe-js"
import { useNavigate, useParams } from "react-router-dom"
import Spacer from "../../components/Spacer"
import MainButton from "../../components/MainButton"
import IconActionPage from "../../components/IconActionPage"
import Cross from "../../assets/icons/Cross"
import { Colors } from "../../enums/Colors"
import { AnalyticsManager } from "../../utils/AnalyticsManager"
import { formatCurrency } from "../../utils/helpers/money"
import { OrderSummary } from "../../components/OrderSummary"
import NavBar from "../../components/NavBar"
import { cancelOrder } from "./cancelOrder"
import { CheckoutCounter } from "./CheckoutCounter"
import { ShimmerText, ShimmerThumbnail } from "react-shimmer-effects"
import OrderStatus from "../../enums/OrderStatus"
import Tick from "../../assets/icons/Tick"

export default function PaymentPageStripe({ order }) {
  const { orderId } = useParams()
  const [stripeProps, setStripeProps] = useState(null)
  const navigate = useNavigate()
  const [isCancellingOrder, setIsCancellingOrder] = useState(null)

  useEffect(() => {
    AnalyticsManager.main.viewPage("StripePayment", { orderId })
  }, [orderId])

  useEffect(() => {
    if (!order || !!stripeProps || order?.status !== OrderStatus.PENDING) { return }
    
    const deviceId = IdentityManager.main.getDeviceId()

    NetworkManager.post("/payment-attempts/stripe", {
      orderId,
      deviceId,
    }).then((res) => {
      const { clientSecret, stripeAccountId } = res.data
      const stripeOptions = !!stripeAccountId ? { stripeAccount: stripeAccountId } : undefined

      setStripeProps({
        stripe: loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY, stripeOptions),
        options: {
          clientSecret,
          appearance: {
            theme: 'flat',
            variables: {
              fontFamily: '"Roboto", sans-serif',
              colorTextPlaceholder: Colors.GRAY_LIGHT,
              colorText: Colors.BLACK,
              colorBackground: Colors.OFF_WHITE_LIGHT,
              borderRadius: "2px",
              spacingGridColumn: "16px",
              spacingGridRow: "16px"
            },
            rules: {
              ".Label": {
                fontFamily: '"Roboto", sans-serif',
                fontSize: "0.9em",
                fontWeight: 600,
                marginBottom: "8px"
              }
            }
          }
        },
      })
    })
  }, [orderId, order, stripeProps])

  const handleRefreshOrder = async () => {
    setIsCancellingOrder(true)
    await cancelOrder(orderId, navigate);
    setIsCancellingOrder(false)
  };

  if (order?.status === OrderStatus.ABANDONED) {
    return <IconActionPage
      Icon={Cross}
      iconBackgroundColor={Colors.RED_LIGHT}
      iconForegroundColor={Colors.RED}
      title="Order timed out"
      body="Your order has timed out, but you can refresh it below."
      primaryActionTitle="Refresh order"
      primaryAction={handleRefreshOrder}
      primaryIsLoading={isCancellingOrder}
    />
  } else if (order?.status === OrderStatus.PAID) {
    return <IconActionPage
      Icon={Tick}
      iconBackgroundColor={Colors.OFF_WHITE_LIGHT}
      iconForegroundColor={Colors.BLACK}
      title="Order paid"
      body="You've already paid for this order."
      primaryActionTitle="View confirmation"
      primaryAction={() => navigate(`/events/s/orders/${order.id}/confirmation`)}
    />
  } else if (stripeProps) {
    return (
      <Elements {...stripeProps}>
        <StripeCheckoutForm order={order} stripeProps={stripeProps} />
      </Elements>
    )
  } else {
    return <StripeDummyPage order={order} />
  }
}

function StripeDummyPage({ order }) {
  const navigate = useNavigate()

  return <div className="container">
    {order && <CheckoutCounter order={order} />}
    <NavBar
      title="Complete your purchase"
      back={order ? () => cancelOrder(order.id, navigate) : null}
    />
    <div className="content">
      <Spacer y={9} />
      <h3 className="header-s">Order summary</h3>
      <Spacer y={2} />
      {
        order ?
          <OrderSummary
            lineItems={order.orderItems}
            currency={order.currency}
            feePercentage={order.customerFee}
          /> :
          <ShimmerText line={4} />
      }

      <Spacer y={3} />
      <h3 className="header-s">Payment details</h3>
      <Spacer y={2} />
      <ShimmerThumbnail height={200} />

      <Spacer y={4} />
      <MainButton
        title="Complete purchase"
        test-id="stripe-payment-button"
        sideMessage={order ? formatCurrency(order.total, order.currency) : null}
        disabled={true}
      />
      <Spacer y={9} />
    </div>
  </div>
}

function StripeCheckoutForm({ order, stripeProps }) {
  const stripe = useStripe()
  const elements = useElements()
  const navigate = useNavigate()
  const [errorData, setErrorData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleError = async (event) => {
    setErrorData(null)
  }

  const handleSubmit = async (event) => {
    setIsLoading(true)

    const redirectUrl = new URL(window.location.href)
    redirectUrl.pathname = "/checkout/stripe-redirect"

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: redirectUrl.href,
      },
    })

    if (result.error) {
      setErrorData({
        title: "Something went wrong",
        description: result.error.message,
      })
    }

    setIsLoading(false)

    return
  }

  if (errorData) {
    return (
      <IconActionPage
        Icon={Cross}
        iconBackgroundColor={Colors.RED_LIGHT}
        iconForegroundColor={Colors.RED}
        title={errorData.title}
        body={errorData.description}
        primaryActionTitle="Go back"
        primaryAction={handleError}
      />
    )
  } else {
    return (
      <div className="container">
        {order && <CheckoutCounter order={order} />}
        <NavBar
          title="Complete your purchase"
          back={order ? () => cancelOrder(order.id, navigate) : null}
        />
        <div className="content">
          <Spacer y={9} />
          <h3 className="header-s">Order summary</h3>
          <Spacer y={2} />
          {
            order ?
              <OrderSummary
                lineItems={order.orderItems}
                currency={order.currency}
                feePercentage={order.customerFee}
              /> :
              <ShimmerText line={4} />
          }
          
          <Spacer y={3} />
          <h3 className="header-s">Payment details</h3>
          <Spacer y={2} />
          {
            stripe && elements ?
              <PaymentElement /> :
              <ShimmerThumbnail height={200} />
          }
          
          <Spacer y={4} />
          <MainButton
            title="Complete purchase"
            test-id="stripe-payment-button"
            sideMessage={order ? formatCurrency(order.total, order.currency) : undefined}
            onClick={handleSubmit}
            isLoading={isLoading}
            disabled={!order || !stripe || !elements || !stripeProps}
          />
          <Spacer y={9} />
        </div>
      </div>
    )
  }
}
