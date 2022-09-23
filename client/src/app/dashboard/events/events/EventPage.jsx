import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import Breadcrumb from "../../../../components/Breadcrumb"
import Spacer from "../../../../components/Spacer"
import MainButton from "../../../../components/MainButton"
import ProductListing from "../products/ProductListing"
import { updateDoc, where } from "firebase/firestore"
import Collection from "../../../../enums/Collection"
import ResultBanner, { ResultType } from "../../../../components/ResultBanner"
import TabControl from "../../../../components/TabControl"
import { NetworkManager } from "../../../../utils/NetworkManager"
import GuestlistTab from "./GuestlistTab"
import LoadingPage from "../../../../components/LoadingPage"
import EventLinkTab from "./EventLinkTab"
import EventDetailsTab from "./EventDetailsTab"
import { ConnectCrezcoBanner, ConnectStripeBanner } from "../merchant/ConnectPaymentMethodsBanner"
import StripeStatus from "../../../../enums/StripeStatus"
import TicketTypesTab from "./TicketTypesTab"

export function ProductWarningBanner({ productCount }) {
  const navigate = useNavigate()

  return productCount === 0 && <div>
    <ResultBanner
      resultType={ResultType.INFO}
      message="You need to create at least one ticket type before you can publish this event."
      action={() => {
        navigate("p/create")
      }}
      actionTitle="Create"
    />
    <Spacer y={1} />
  </div>
}

export function canPublishEvent(productCount, merchant) {
  const hasConnectedStripeIfNeeded = merchant.stripe?.status === StripeStatus.CHARGES_ENABLED || merchant.currency === "GBP"
  return productCount > 0 && hasConnectedStripeIfNeeded
}

export function PublishBanner({ isPublished, productCount, merchant }) {
  const { eventId } = useParams()
  const eventRef = Collection.EVENT.docRef(eventId)
  const publishBannerProps = canPublishEvent(productCount, merchant) ? {
    action: async () => await updateDoc(eventRef, { isPublished: true }),
    actionTitle: "Publish"
  } : {}

  return !isPublished && <div>
    <ResultBanner
      resultType={ResultType.INFO}
      message="This event isn't published yet. You'll need to publish it before it shows to customers."
      {...publishBannerProps}
    />
    <Spacer y={1} />
  </div>
}

export default function EventPage({ merchant, event, products }) {
  const navigate = useNavigate()
  const { merchantId, eventId } = useParams()
  const [attributionLinks, setAttributionLinks] = useState(null)
  const [guestlistData, setGuestlistData] = useState(null)

  useEffect(() => {
    return Collection.ATTRIBUTION_LINK.queryOnChange(
      setAttributionLinks,
      where("merchantId", "==", merchantId)
    )
  }, [merchantId])

  useEffect(() => {
    NetworkManager.get(
      `/merchants/m/${merchantId}/eventAttendees/${eventId}`
    ).then((res) => {
      setGuestlistData(res.data)
    })
  }, [eventId, merchantId])

  let guestlistTab

  if (guestlistData) {
    guestlistTab = <div style={{ maxWidth: 500 }}>
      <Link to={`/ticket-checker/${merchantId}/${eventId}/checker`}>
        <MainButton title="Scan tickets for this event" />
      </Link>
      <Spacer y={3} />
      <GuestlistTab event={event} guestlistData={guestlistData} />
    </div>
  } else {
    guestlistTab = <LoadingPage />
  }

  return (
    <div>
      <Spacer y={2} />
      <Breadcrumb
        pageData={[
          { title: "Events", path: "../..", testId: "events" },
          { title: event.title },
        ]}
      />
      <Spacer y={2} />
      <h1 className="header-l">{event.title}</h1>
      <Spacer y={3} />
      {
        event.eventRecurrenceId && <div style={{ maxWidth: 500 }}>
          <ResultBanner
            resultType={ResultType.INFO}
            message="This event is part of a schedule, but any changes you make here will only apply to this event."
            actionTitle="Edit schedule"
            action={() => navigate(`../../er/${event.eventRecurrenceId}`)}
          />
          <Spacer y={3} />
        </div>
      }
      
      <div style={{ maxWidth: 500 }}>
        <PublishBanner isPublished={event.isPublished} productCount={products.length} merchant={merchant} />
        <ConnectCrezcoBanner merchant={merchant} />
        <ConnectStripeBanner merchant={merchant} />
        <ProductWarningBanner productCount={products.length} />
      </div>

      <Spacer y={3} />
      
      <TabControl 
        name="event-page"
        tabs={{
          "Event details": <EventDetailsTab event={event} products={products} merchant={merchant} />,
          "Ticket types": <TicketTypesTab products={products} merchant={merchant} />,
          "Event links": <EventLinkTab merchant={merchant} event={event} attributionLinks={attributionLinks} />,
          "Guestlist": guestlistTab
        }}
      />

      <Spacer y={9} />
    </div>
  )
}
