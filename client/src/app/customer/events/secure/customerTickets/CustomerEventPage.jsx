import { useEffect } from "react"
import { Link, useParams } from "react-router-dom"
import Clock from "../../../../../assets/icons/Clock"
import Location from "../../../../../assets/icons/Location"
import User from "../../../../../assets/icons/User"
import AsyncImage from "../../../../../components/AsyncImage"
import { Colors } from "../../../../../enums/Colors"
import CircleIcon from "../../../../../components/CircleIcon"
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
import { ShimmerThumbnail, ShimmerTitle, ShimmerText } from "react-shimmer-effects"
import Spinner from "../../../../../assets/Spinner"
import { Container } from "../../../../brand/FAQsPage"
import Content from "../../../../../components/layout/Content"
import { Anchor, Body } from "../../../../auth/AuthPage"
import { Flex } from "../../../../../components/Listing"

export default function CustomerEventPage({ events }) {
  const { eventId } = useParams()
  const { width } = useWindowSize()
  const contentWidth = Math.min(width, 500)
  const headerImageHeight = contentWidth
  const event = events?.find((event) => event.id === eventId)

  useEffect(() => AnalyticsManager.main.viewPage("CustomerEvent", { eventId }), [eventId])

  if (events && !event) {
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
    <Container>
      <EventsAppNavBar
        title={event?.title ?? <Spinner length={20} />}
        transparentDepth={headerImageHeight - 96}
        opaqueDepth={headerImageHeight - 48}
        back=".."
      />

      <Helmet>
        <title>{`${event?.title ?? ""} | Mercado`}</title>
      </Helmet>

      {
        event ?
          <AsyncImage
            imageRef={getEventStorageRef(event, event.photo)}
            className="headerImage"
            alt={event.title}
          /> :
          <ShimmerThumbnail height={headerImageHeight} />
      }

      <Content paddingTop={32}>
        {
          event ?
            <h1 className="header-l">{event.title}</h1> :
            <ShimmerTitle />
        }
        
        <Spacer y={2} />
        
        {
          event ?
            <div>
              <Flex columnGap={8}>
                <CircleIcon Icon={Clock} length={20} backgroundColor={Colors.CLEAR} />
                <Body>{eventTimeString(event)}</Body>
              </Flex>
              <Spacer y={1} />
              <Flex columnGap={8}>
                <CircleIcon
                  Icon={Location}
                  length={20}
                  backgroundColor={Colors.CLEAR}
                />
                <Body>
                  {`${event.address} · `}
                  <Anchor
                    href={generateGoogleMapsLink(event)}
                    test-id="event-details-directions-link"
                  >Get directions</Anchor>
                </Body>
              </Flex>
              <Spacer y={1} />
              <Flex columnGap={8}>
                <CircleIcon
                  Icon={User}
                  length={20}
                  backgroundColor={Colors.CLEAR}
                />
                <Body>
                  <Link to={`/events/${event.merchantId}`} test-id="event-details-organiser-link">
                    View organiser
                  </Link>
                </Body>
              </Flex>
            </div> :
            <ShimmerText line={3} />
        }
        <Spacer y={4} />

        {
          event ?
            <ShowMoreText lines={5} keepNewLines={true} className="text-body-faded">
              {event.description}
            </ShowMoreText> :
            <ShimmerText line={4} />
        }

        <Spacer y={4} />

        <h1 className="header-m">Your tickets</h1>

        <Spacer y={2} />

        {
          event ?
            event.products.map((product) => {
              return <div key={product.id}>
                <h2 className="header-s">{product.title}</h2>
                {
                  product.purchaserInfo && <div>
                    <Spacer y={2} />
                    <h4 className="header-xs">Ticket information</h4>
                    <Spacer y={2} />
                    <p className="text-body">
                      {product.purchaserInfo}
                    </p>
                  </div>
                }
                <Spacer y={2} />

                {product.tickets.map((ticket, index) => <Ticket
                  key={ticket.id}
                  ticket={ticket}
                  product={product}
                  index={index + 1}
                  style={{ marginBottom: 16 }}
                />)}
                <Spacer y={2} />
              </div>
            }) :
            <div>
              <ShimmerThumbnail height={200} />
              <Spacer y={2} />
              <ShimmerThumbnail height={200} />
              <Spacer y={2} />
              <ShimmerThumbnail height={200} />
            </div>
        }
      </Content>
    </Container>
  )
}
