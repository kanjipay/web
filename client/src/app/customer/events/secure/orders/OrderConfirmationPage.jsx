import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import LoadingPage from "../../../../../components/LoadingPage"
import MainButton from "../../../../../components/MainButton"
import { OrderSummary } from "../../../../../components/OrderSummary"
import ResultBanner, {
  ResultType,
} from "../../../../../components/ResultBanner"
import Spacer from "../../../../../components/Spacer"
import Collection from "../../../../../enums/Collection"
import { AnalyticsManager } from "../../../../../utils/AnalyticsManager"
import { auth } from "../../../../../utils/FirebaseUtils"
import useAttribution from "../../../../shared/attribution/useAttribution"
import EventsAppNavBar from "../EventsAppNavBar"
import { Helmet } from "react-helmet-async"
import { logMetaPixelEvent } from "../../../../../utils/MetaPixelLogger"
import { getDoc } from "firebase/firestore"

export default function OrderConfirmationPage({ user }) {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const { clearItems } = useAttribution()
  const [wasAttributionCleared, setWasAttributionCleared] = useState(false)

  useEffect(() => {
    AnalyticsManager.main.viewPage("TicketOrderConfirmation", { orderId })
  }, [orderId])

  useEffect(() => {
    return Collection.ORDER.onChange(orderId, setOrder)
  }, [orderId])

  useEffect(() => {
    if (!order) {
      return
    }
    console.log('started logging payment confirmation')
    getDoc(Collection.MERCHANT.docRef(order.merchantId)).then((merchantDoc) => {
      const { metaPixelId } = merchantDoc.data()
      const purchaseData = { value: order.total, currency: "GBP" }
      logMetaPixelEvent(metaPixelId, auth.currentUser, "Purchase") // todo add data with productId, total // todo switch to other user
      console.log('finished logging payment confirmation')

    })
  }, [order])

  useEffect(() => {
    if (!order || wasAttributionCleared) {
      return
    }

    const { eventId } = order

    setWasAttributionCleared(true)

    clearItems({ eventId })
  }, [order, wasAttributionCleared, clearItems])

  const currUser = auth.currentUser

  if (order) {
    return (
      <div className="container">
        <EventsAppNavBar title="Your tickets" />

        <Helmet>
          <title>Your order | Mercado</title>
        </Helmet>

        <div className="content">
          <Spacer y={9} />

          <ResultBanner
            resultType={ResultType.SUCCESS}
            message="Your payment was successful"
          />
          <Spacer y={3} />
          <h1 className="header-l">Enjoy your event!</h1>
          <Spacer y={2} />
          <p className="text-body-faded">
            We just emailed your tickets to your email address
            <span
              className="text-body-faded"
              style={{ fontWeight: 500 }}
            >{` ${currUser.email}`}</span>
            . The email may take a few moments to go through.
          </p>
          <Spacer y={2} />
          <p className="text-body-faded">
            Alternatively, you can access your tickets by clicking the icon in
            the top right, which takes you to your profile page.
          </p>

          <Spacer y={3} />
          <h3 className="header-s">Order summary</h3>
          <Spacer y={2} />
          <OrderSummary
            lineItems={order.orderItems}
            currency={order.currency}
            feePercentage={order.customerFee}
          />
        </div>

        <div className="anchored-bottom">
          <div style={{ margin: "16px" }}>
            <MainButton
              title="Done"
              test-id="ticket-order-confirmation-done-button"
              style={{ boxSizing: "borderBox" }}
              onClick={() => navigate(`/events/s/tickets`)}
            />
          </div>
        </div>
      </div>
    )
  } else {
    return <LoadingPage />
  }
}
