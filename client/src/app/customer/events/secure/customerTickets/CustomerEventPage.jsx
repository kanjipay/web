import { useEffect } from "react"
import { Link, useParams } from "react-router-dom"
import Clock from "../../../../../assets/icons/Clock"
import Location from "../../../../../assets/icons/Location"
import User from "../../../../../assets/icons/User"
import AsyncImage from "../../../../../components/AsyncImage"
import { Colors } from "../../../../../enums/Colors"
import CircleIcon from "../../../../../components/CircleIcon"
import LoadingPage from "../../../../../components/LoadingPage"
import Spacer from "../../../../../components/Spacer"
import { AnalyticsManager } from "../../../../../utils/AnalyticsManager"
import { getEventStorageRef } from "../../../../../utils/helpers/storage"
import ShowMoreText from "react-show-more-text"
import {
  eventTimeString,
  generateGoogleMapsLink,
} from "../../event/eventHelpers"
import EventsAppNavBar from "../EventsAppNavBar"
import Ticket from "./Ticket"
import { Helmet } from "react-helmet-async"
import IconPage from "../../../../../components/IconPage"
import Cross from "../../../../../assets/icons/Cross"
import useWindowSize from "../../../../../utils/helpers/useWindowSize"

export default function CustomerEventPage({ events }) {
  const { eventId } = useParams()

  const { width } = useWindowSize()
  const contentWidth = Math.min(width, 600)
  const headerImageHeight = contentWidth / 2

  useEffect(() => {
    AnalyticsManager.main.viewPage("CustomerEvent", { eventId })
  }, [eventId])

  if (events) {
    const event = events.find((event) => event.id === eventId)

    if (!event) {
      return (
        <IconPage
          title="Event not found"
          body="We couldn't find this event."
          Icon={Cross}
          iconBackgroundColor={Colors.RED_LIGHT}
          iconForegroundColor={Colors.RED}
        />
      )
    }

    return (
      <div className="container">
        <EventsAppNavBar
          title={event.title}
          transparentDepth={headerImageHeight - 96}
          opaqueDepth={headerImageHeight - 48}
          back=".."
        />

        <Helmet>
          <title>{`${event.title} | Mercado`}</title>
        </Helmet>

        <AsyncImage
          imageRef={getEventStorageRef(event, event.photo)}
          className="headerImage"
          alt={event.title}
        />

        <Spacer y={4} />

        <div className="content">
          <h1 className="header-l">{event.title}</h1>
          <Spacer y={2} />
          <div style={{ columnGap: 8, display: "flex" }}>
            <CircleIcon
              Icon={Clock}
              length={20}
              backgroundColor={Colors.CLEAR}
            />
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
              >
                Get directions
              </a>
            </p>
          </div>
          <Spacer y={1} />
          <div style={{ columnGap: 8, display: "flex" }}>
            <CircleIcon
              Icon={User}
              length={20}
              backgroundColor={Colors.CLEAR}
            />
            <p className="text-body">
              <Link to={`/events/${event.merchantId}`}>View organiser</Link>
            </p>
          </div>
          <Spacer y={4} />
          <ShowMoreText lines={5} keepNewLines={true} className="text-body-faded">
            {event.description}
          </ShowMoreText>

          <Spacer y={4} />

          <h1 className="header-m">Your tickets</h1>
          <Spacer y={2} />

          {event.products.map((product) => {
            return (
              <div key={product.id}>
                {product.tickets.map((ticket, index) => {
                  return (
                    <div key={ticket.id}>
                      <Ticket
                        ticket={ticket}
                        product={product}
                        index={index + 1}
                      />
                      <Spacer y={2} />
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    )
  } else {
    return <LoadingPage />
  }
}
