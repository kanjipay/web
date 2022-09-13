import { useEffect } from "react"
import AsyncImage from "../../../../components/AsyncImage"
import Spacer from "../../../../components/Spacer"
import { AnalyticsManager } from "../../../../utils/AnalyticsManager"
import { getMerchantStorageRef } from "../../../../utils/helpers/storage"
import EventListing from "../event/EventListing"
import EventsAppNavBar from "../secure/EventsAppNavBar"
import { Helmet } from "react-helmet-async"
import ShowMoreText from "react-show-more-text"
import useWindowSize from "../../../../utils/helpers/useWindowSize"
import { useParams } from "react-router-dom"
import { dateFromTimestamp } from "../../../../utils/helpers/time"
import Spinner from "../../../../assets/Spinner"
import { ShimmerThumbnail, ShimmerTitle, ShimmerText } from "react-shimmer-effects";

export default function MerchantPage({ merchant, events }) {
  const { merchantId } = useParams()
  const { width } = useWindowSize()
  const contentWidth = Math.min(width, 500)
  const headerImageHeight = contentWidth / 2

  const publishedEvents = events?.filter(e => e.isPublished)
  const upcomingEvents = publishedEvents?.filter(e => dateFromTimestamp(e.endsAt) > new Date())
  const pastEvents = publishedEvents?.filter(e => dateFromTimestamp(e.endsAt) <= new Date())

  useEffect(() => {
    AnalyticsManager.main.viewPage("TicketMerchant", { merchantId })
  }, [merchantId])

  return (
    <div className="container">
      <EventsAppNavBar
        title={merchant ? merchant.displayName : <Spinner length={20} />}
        transparentDepth={headerImageHeight - 96}
        opaqueDepth={headerImageHeight - 48}
      />

      <Helmet>
        <title>{`${merchant?.displayName ?? ""} | Mercado`}</title>
      </Helmet>

      {
        merchant ?
          <AsyncImage
            imageRef={getMerchantStorageRef(merchant.id, merchant.photo)}
            style={{ width: "100%", aspectRatio: "2/1" }}
            alt={merchant.displayName}
          /> :
          <ShimmerThumbnail height={headerImageHeight} />
      }

      <Spacer y={3} />

      <div className="content">
        {
          merchant ?
            <div>
              <h1 className="header-l">{merchant.displayName}</h1>
              {
                merchant.description?.length > 0 && <div>
                  <Spacer y={4} />

                  <ShowMoreText lines={5} keepNewLines={true} className="text-body-faded">
                    {merchant.description}
                  </ShowMoreText>
                </div>
              }
            </div> :
            <div>
              <ShimmerTitle />
              <Spacer y={3} />
              <ShimmerText />
            </div>
        }

        <Spacer y={4} />

        <h2 className="header-m">Upcoming events</h2>
        <Spacer y={2} />
        {
          !!upcomingEvents ?
            upcomingEvents.length > 0 ?
              upcomingEvents.map(event => <div key={event.id}>
                <EventListing event={event} />
                <Spacer y={3} />
              </div>) :
              <p>No upcoming events</p>
              :
            <div>
              <ShimmerThumbnail height={headerImageHeight - 32} rounded={true} />
              <ShimmerText line={2} />
            </div>
        }

        <Spacer y={3} />

        <h2 className="header-m">Past events</h2>
        <Spacer y={2} />
        {
          !!pastEvents ?
            pastEvents.length > 0 ?
              pastEvents.map(event => <div key={event.id}>
                <EventListing event={event} />
                <Spacer y={3} />
              </div>) :
              <p>No past events</p>
            :
            <div>
              <ShimmerThumbnail height={headerImageHeight - 32} rounded={true} />
              <ShimmerText line={2} />
            </div>
        }

        <Spacer y={6} />
      </div>
    </div>
  )
}
