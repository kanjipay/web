import Clock from "../../../../assets/icons/Clock"
import User from "../../../../assets/icons/User"
import Location from "../../../../assets/icons/Location"
import AsyncImage from "../../../../components/AsyncImage"
import CircleIcon from "../../../../components/CircleIcon"
import Spacer from "../../../../components/Spacer"
import { getEventStorageRef } from "../../../../utils/helpers/storage"
import { Link, useNavigate, useParams } from "react-router-dom"
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
import useWindowSize from "../../../../utils/helpers/useWindowSize"
import MainButton from "../../../../components/MainButton"
import { useState } from "react"
import { formatCurrency } from "../../../../utils/helpers/money"

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
                      <span key={artist.id}>
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
  const navigate = useNavigate()

  const { width } = useWindowSize()
  const contentWidth = Math.min(width, 500)
  const headerImageHeight = contentWidth
  const hasAlreadyHappened =
    new Date() >= addMinutes(dateFromTimestamp(event.endsAt), -30)

  const [isTicketsButtonVisible, setIsTicketsButtonVisible] = useState(!hasAlreadyHappened)

  useEffect(() => {
    if (hasAlreadyHappened) { return }

    const target = document.querySelector('#get-tickets')
    const observer = new IntersectionObserver(entries => {
      const shouldTicketsButtonBeVisible = !entries[0].isIntersecting && !hasAlreadyHappened

      if (shouldTicketsButtonBeVisible !== isTicketsButtonVisible) {
        setIsTicketsButtonVisible(shouldTicketsButtonBeVisible)
      }
    })

    observer.observe(target)
  })

  useEffect(() => {
    AnalyticsManager.main.viewPage("Event", { merchantId, eventId })
  }, [eventId, merchantId])

  const eligibleProducts = products.filter(product => !product.isPrivate)

  const handleGetTickets = () => {
    if (eligibleProducts.length === 1) {
      navigate(eligibleProducts[0].id)
    } else {
      const element = document.getElementById("get-tickets");
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <div className="container">
      <EventsAppNavBar
        title={event.title}
        transparentDepth={headerImageHeight - 96}
        opaqueDepth={headerImageHeight - 48}
        back="../.."
      />

      <Helmet>
        <title>
          {`${event.title} | ${merchant.displayName} | Mercado`}
        </title>
      </Helmet>

      <AsyncImage
        imageRef={getEventStorageRef(event, event.photo)}
        style={{ width: "100%", aspectRatio: "1/1" }}
        alt={merchant.displayName}
      />

      {
        isTicketsButtonVisible && <div className="anchored-bottom">
          <MainButton 
            title="Get tickets" 
            onClick={handleGetTickets}
            sideMessage={eligibleProducts.length === 1 ? formatCurrency(eligibleProducts[0].price, merchant.currency) : null}
            style={{ borderRadius: 0 }}
          />
        </div>
      }

      <Spacer y={3} />

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

        {
          event.description?.length > 0 && <div>
            <Spacer y={4} />
            <ShowMoreText lines={5} keepNewLines={true} className="text-body-faded">
              {event.description}
            </ShowMoreText>
          </div>
        }

        <Spacer y={4} />

        {hasAlreadyHappened ? (
          <p>
            This event ended on{" "}
            {format(dateFromTimestamp(event.endsAt), "do MMM")} at{" "}
            {format(dateFromTimestamp(event.endsAt), "H:mm")}.
          </p>
        ) : (
          <div>
            <h2 className="header-m" id="get-tickets">Get tickets</h2>
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
            {products
              .filter(product => !product.isPrivate)
              .map((product) => {
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
              })
            }
          </div>
        )}
        <Spacer y={8} />
      </div>
    </div>
  )
}
