import Clock from "../../../../assets/icons/Clock"
import User from "../../../../assets/icons/User"
import Location from "../../../../assets/icons/Location"
import AsyncImage from "../../../../components/AsyncImage"
import CircleIcon from "../../../../components/CircleIcon"
import Spacer from "../../../../components/Spacer"
import { getEventStorageRef } from "../../../../utils/helpers/storage"
import { Link, useParams } from "react-router-dom"
import ProductListing from "../product/ProductListing"
import EventsAppNavBar from "../secure/EventsAppNavBar"
import { eventTimeString, generateGoogleMapsLink } from "./eventHelpers"
import { Colors } from "../../../../enums/Colors"
import ShowMoreText from "react-show-more-text"
import { dateFromTimestamp } from "../../../../utils/helpers/time"
import { useEffect } from "react"
import { AnalyticsManager } from "../../../../utils/AnalyticsManager"
import { addMinutes, format } from "date-fns"
import { Helmet } from "react-helmet-async"

export function EventDetails({ event, merchant, artists = [] }) {
  return (
    <div>
      <div style={{ columnGap: 8, display: "flex" }}>
        <CircleIcon Icon={Clock} length={20} backgroundColor={Colors.CLEAR} />
        <p className="text-body">{eventTimeString(event)}</p>
      </div>
      <Spacer y={1} />
      <div style={{ columnGap: 8, display: "flex" }}>
        <CircleIcon
          Icon={Location}
          length={20}
          backgroundColor={Colors.CLEAR}
        />
        <p className="text-body">
          {`${event.address} · `}
          <a
            href={generateGoogleMapsLink(event)}
            target="_blank"
            rel="noreferrer"
            test-id="event-details-directions-link"
          >
            Get directions
          </a>
        </p>
      </div>
      {merchant && (
        <div>
          <Spacer y={1} />
          <div style={{ columnGap: 8, display: "flex" }}>
            <CircleIcon
              Icon={User}
              length={20}
              backgroundColor={Colors.CLEAR}
            />
            <p className="text-body">
              {artists.length > 0 && (
                <span>
                  {"Artists: "}
                  {artists.map((artist, index) => {
                    return (
                      <span>
                        {index > 0 ? ", " : ""}
                        <Link
                          to={`/events/artists/${artist.id}`}
                          target="_blank"
                          rel="noreferrer"
                          test-name="event-details-artist-link"
                        >
                          {artist.name}
                        </Link>
                      </span>
                    )
                  })}
                  {". "}
                </span>
              )}
              Organised by{" "}
              <Link to="../.." test-id="event-details-organiser-link">
                {merchant.displayName}
              </Link>
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default function EventPage({ merchant, event, products, artists }) {
  const { eventId, merchantId } = useParams()

  useEffect(() => {
    AnalyticsManager.main.viewPage("Event", { merchantId, eventId })
  }, [eventId, merchantId])

  const hasAlreadyHappened =
    new Date() >= addMinutes(dateFromTimestamp(event.endsAt), -30)

  return (
    <div className="container">
      <EventsAppNavBar
        title={event.title}
        transparentDepth={50}
        opaqueDepth={100}
        backPath="../.."
      />

      <AsyncImage
        imageRef={getEventStorageRef(merchant.id, event.id, event.photo)}
        className="headerImage"
        alt={merchant.displayName}
      />

      <Helmet>
        <title>
          {`${event.title} | ${merchant.displayName} | Mercado`}
        </title>
      </Helmet>

      <Spacer y={4} />

      <div className="content">
        <h1 className="header-l">{event.title}</h1>
        {event.tags && event.tags.length > 0 && (
          <div>
            <Spacer y={2} />
            <div style={{ display: "flex", columnGap: 4 }}>
              {event.tags.map((tag) => {
                return (
                  <p
                    key={tag}
                    className="text-body"
                    style={{
                      padding: "4px 8px",
                      backgroundColor: Colors.OFF_WHITE_LIGHT,
                    }}
                  >
                    {tag}
                  </p>
                )
              })}
            </div>
          </div>
        )}
        <Spacer y={2} />

        <EventDetails event={event} merchant={merchant} artists={artists} />
        <Spacer y={4} />
        <ShowMoreText lines={3} className="text-body-faded">
          {event.description}
        </ShowMoreText>

        <Spacer y={4} />

        {hasAlreadyHappened ? (
          <p>
            This event ended on{" "}
            {format(dateFromTimestamp(event.endsAt), "do MMM")} at{" "}
            {format(dateFromTimestamp(event.endsAt), "H:mm")}.
          </p>
        ) : (
          <div>
            <h1 className="header-m">Get tickets</h1>
            <Spacer y={2} />
            {!event.isPublished && (
              <div>
                <p>
                  {event.publishScheduledAt
                    ? `Tickets to this event will become available on ${format(
                        dateFromTimestamp(event.endsAt),
                        "do MMM"
                      )} at ${format(dateFromTimestamp(event.endsAt), "H:mm")}.`
                    : "The event organiser hasn't made tickets available yet."}
                </p>
                <Spacer y={2} />
              </div>
            )}
            {products.map((product) => {
              return (
                <div key={product.id}>
                  <ProductListing
                    product={product}
                    currency={merchant.currency}
                    isPublished={event.isPublished}
                  />
                  <Spacer y={1} />
                </div>
              )
            })}
          </div>
        )}
        <Spacer y={8} />
      </div>
    </div>
  )
}
