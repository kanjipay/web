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

function PublishInfoBanners({ hasProducts }) {
  const navigate = useNavigate()
  const { eventId } = useParams()

  let publishBannerProps = {}

  if (hasProducts) {
    const eventRef = Collection.EVENT.docRef(eventId)
    publishBannerProps = {
      action: async () => await updateDoc(eventRef, { isPublished: true }),
      actionTitle: "Publish"
    }
  }

  const banners = [
    <ResultBanner
      resultType={ResultType.INFO}
      message="This event isn't published yet. You'll need to publish it before it shows to customers."
      {...publishBannerProps}
    />,
  ]

  if (!hasProducts) {
    banners.push(
      <ResultBanner
        resultType={ResultType.INFO}
        message="You need to create at least one ticket type before you can publish this event."
        action={() => {
          navigate("p/create")
        }}
        actionTitle="Create"
      />
    )
  }

  const children = banners.flatMap((banner, index) => {
    if (index === 0) {
      return [banner]
    } else {
      return [<Spacer y={2} />, banner]
    }
  })

  return <div>{children}</div>
}

export default function EventPage({ merchant, event, products }) {
  const navigate = useNavigate()
  const { merchantId, eventId } = useParams()
  const [attributionLinks, setAttributionLinks] = useState(null)
  const [guestlistData, setGuestlistData] = useState(null)

  const handleCreateProduct = () => {
    navigate("p/create")
  }

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

  const ticketTypes = <div style={{ maxWidth: 500 }}>
    {products.length > 0 ? (
      <div>
        <MainButton
          title="Create new ticket type"
          onClick={handleCreateProduct}
          test-id="create-product-button"
          style={{ padding: "0 16px" }}
        />
        <Spacer y={3} />
        {products.map((product) => {
          return (
            <div key={product.id}>
              <ProductListing
                product={product}
                currency={merchant.currency}
              />
              <Spacer y={2} />
            </div>
          )
        })}
      </div>
    ) : (
      <div>
        <p>
          You don't have any ticket types for this event yet. You'll need
          at least one before you can publish the event.
        </p>
        <Spacer y={3} />
        <MainButton
          title="Create ticket type"
          onClick={handleCreateProduct}
          test-id="create-product-button"
          style={{ padding: "0 16px" }}
        />
      </div>
    )}
  </div>

  let guestlistTab

  if (guestlistData) {
    guestlistTab = <div style={{ maxWidth: 500 }}>
      <GuestlistTab event={event} guestlistData={guestlistData} />
      <Spacer y={3} />
      
      <Link to={`/ticket-checker/${merchantId}/${eventId}/checker`}>
        <MainButton title="Scan tickets for this event" />
      </Link>
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
      {
        !merchant.crezco?.userId &&  <div style={{ maxWidth: 500 }}>
        <ResultBanner
            resultType={ResultType.INFO}
            message="Connect with our payment partner, Crezco to reduce fees and get earlier payouts."
            action={() => {
              navigate(`/dashboard/o/${merchant.id}/connect-crezco`)
            }}
            actionTitle="Connect payments"
          />
          <Spacer y={3} />
        </div>
      }
      {
        !event.isPublished && <div style={{ maxWidth: 500 }}>
          <PublishInfoBanners
            merchant={merchant}
            hasProducts={products.length > 0}
          />
          <Spacer y={3} />
        </div>
      }
      
      <TabControl 
        name="event-page"
        tabs={{
          "Event details": <EventDetailsTab event={event} products={products} />,
          "Ticket types": ticketTypes,
          "Event links": <EventLinkTab merchant={merchant} event={event} attributionLinks={attributionLinks} />,
          "Guestlist": guestlistTab
        }}
      />

      <Spacer y={9} />
    </div>
  )
}
