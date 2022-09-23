import { ButtonTheme } from "../../../../../components/ButtonTheme"
import SmallButton from "../../../../../components/SmallButton"
import Spacer from "../../../../../components/Spacer"
import { auth } from "../../../../../utils/FirebaseUtils"
import EventListing from "../../event/EventListing"
import EventsAppNavBar from "../EventsAppNavBar"
import { useEffect } from "react"
import { AnalyticsManager } from "../../../../../utils/AnalyticsManager"
import { Helmet } from "react-helmet-async"
import { dateFromTimestamp } from "../../../../../utils/helpers/time"
import { ShimmerThumbnail } from "react-shimmer-effects"
import useWindowSize from "../../../../../utils/helpers/useWindowSize"
import { Container } from "../../../../brand/FAQsPage"
import Content from "../../../../../components/layout/Content"
import { Body } from "../../../../auth/AuthPage"

export default function CustomerEventListPage({ events }) {
  useEffect(() => AnalyticsManager.main.viewPage("CustomerEventList"), [])

  const pastEvents = events?.filter(event => dateFromTimestamp(event.endsAt) < new Date())
  const upcomingEvents = events?.filter(event => dateFromTimestamp(event.endsAt) >= new Date())
  const { width } = useWindowSize()
  const contentWidth = Math.min(width, 500)

  return <Container>
    <EventsAppNavBar title="Your events" />

    <Helmet>
      <title>Your tickets | Mercado</title>
    </Helmet>
    
    <Content>
      <h1 className="header-l">Your events</h1>
      <Spacer y={3} />
      <Body isFaded>Click on an event to view your tickets.</Body>
      <Spacer y={3} />
      <h2 className="header-m">Upcoming</h2>
      <Spacer y={2} />
      {upcomingEvents ?
        (
          upcomingEvents.length > 0 ?
            upcomingEvents.map((event) => {
              const ticketCount = event.products.reduce((ticketCount, product) => ticketCount + product.tickets.length, 0)

              return <EventListing
                event={event}
                key={event.id}
                rightCornerText={`${ticketCount} tickets`}
                style={{ marginBottom: 24 }}
              />
            }) :
            <Body isFaded>No upcoming events.</Body>
        ) :
        <ShimmerThumbnail height={contentWidth - 32} />}

      <Spacer y={4} />

      <h2 className="header-m">Past</h2>
      <Spacer y={2} />
      {
        pastEvents ?
          (
            pastEvents.length > 0 ?
              pastEvents.map((event) => {
                return (
                  <div key={event.id}>
                    <EventListing event={event} />
                    <Spacer y={3} />
                  </div>
                )
              }) :
              <Body isFaded>No past events.</Body>
          ) :
          <ShimmerThumbnail height={contentWidth - 32} />
      }
    </Content>
  </Container>
}
