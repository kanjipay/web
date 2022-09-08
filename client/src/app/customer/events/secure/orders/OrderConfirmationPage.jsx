import { useEffect, useState } from "react"
import { useLocation, useNavigate, useParams } from "react-router-dom"
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
import { ButtonTheme } from "../../../../../components/ButtonTheme"
import { UAParser } from "ua-parser-js"
import { NetworkManager } from "../../../../../utils/NetworkManager"
import { download } from "../../../../dashboard/events/events/GuestlistTab"


export default function OrderConfirmationPage({ user }) {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [order, setOrder] = useState(null)
  const { clearItems } = useAttribution()
  const [wasAttributionCleared, setWasAttributionCleared] = useState(false)
  const userAgent = UAParser(navigator.userAgent)
  const isAppleOS = ["iOS", "Mac OS"].includes(userAgent.os.name)
  const [applePassData, setApplePassData] = useState(null)
  const [wasApplePassButtonPressed, setWasApplePassButtonPressed] = useState(false)


  useEffect(() => {
    AnalyticsManager.main.viewPage("TicketOrderConfirmation", { orderId })

    function base64ToBuffer(str) {
      str = window.atob(str); // creates a ASCII string
      var buffer = new ArrayBuffer(str.length),
        view = new Uint8Array(buffer);
      for (var i = 0; i < str.length; i++) {
        view[i] = str.charCodeAt(i);
      }
      return buffer;
    }

    async function fetchApplePasses() {
      const res = await NetworkManager.get(`/orders/o/${orderId}/apple-pass`)
      const { passStrings, passesString } = res.data
      const passBuffers = passStrings.map(base64ToBuffer)
      const passesBuffer = base64ToBuffer(passesString)

      setApplePassData({ passBuffers, passesBuffer })
    }

    fetchApplePasses()

    return Collection.ORDER.onChange(orderId, setOrder)
  }, [orderId])

  useEffect(() => {
    if (!applePassData || !wasApplePassButtonPressed) { return }

    setWasApplePassButtonPressed(false)

    const { passesBuffer, passBuffers } = applePassData

    if (passBuffers.length > 1) {
      download(location, passesBuffer, userAgent.os.name === "iOS" ? "passes.pkpasses" : "passes.zip", "application/vnd.apple.pkpasses")
    } else {
      download(location, passBuffers[0], "pass.pkpass", "application/vnd.apple.pkpass")
    }
  }, [applePassData, wasApplePassButtonPressed, location, userAgent.os.name])

  const handleFetchApplePasses = () => setWasApplePassButtonPressed(true)

  useEffect(() => {
    if (!order) {
      return
    }
    getDoc(Collection.MERCHANT.docRef(order.merchantId)).then((merchantDoc) => {
      const { metaPixelId } = merchantDoc.data()
      const purchaseData = { value: order.total, currency: "GBP" }
      logMetaPixelEvent(metaPixelId, user, "Purchase") // todo add data with productId, total // todo switch to other user
    })
  }, [order, user])

  useEffect(() => {
    if (!order || wasAttributionCleared) {
      return
    }

    const { eventId, eventRecurrenceId } = order

    setWasAttributionCleared(true)

    clearItems({ eventId })
    clearItems({ eventRecurrenceId })
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
            . The email may take a few moments to go through, and be sure to check your spam folder.
          </p>

          <Spacer y={3} />
          <h3 className="header-s">Order summary</h3>
          <Spacer y={2} />
          <OrderSummary
            lineItems={order.orderItems}
            currency={order.currency}
            feePercentage={order.customerFee}
          />
          <Spacer y={3} />
          <h3 className="header-s">View my tickets</h3>
          <Spacer y={2} />
          <a href={order.googlePassUrl} >
            <MainButton 
              title="Save to google wallet"
              icon="/img/google.png"
              buttonTheme={ButtonTheme.MONOCHROME_OUTLINED}
            />
          </a>

           <Spacer y={2} />
          </div>
          )}
          {
            isAppleOS && <div>
              <MainButton
                title="Add to Apple Wallet"
                icon="/img/apple.png"
                isLoading={wasApplePassButtonPressed && !applePassData}
                onClick={handleFetchApplePasses}
              />
              <Spacer y={2} />
            </div>
          }
          <MainButton
            title="View online"
            test-id="ticket-order-confirmation-done-button"
            onClick={() => navigate(`/events/s/tickets`)}
          />
          <Spacer y={9} />
        </div>
      </div>
    )
  } else {
    return <LoadingPage />
  }
}
