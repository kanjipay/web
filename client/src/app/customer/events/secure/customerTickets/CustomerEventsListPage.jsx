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

export default function CustomerEventListPage({ events }) {
  useEffect(() => {
    AnalyticsManager.main.viewPage("CustomerEventList")
  }, [])

  const pastEvents = events?.filter(event => dateFromTimestamp(event.endsAt) < new Date())
  const upcomingEvents = events?.filter(event => dateFromTimestamp(event.endsAt) >= new Date())

  const handleSignOut = () => {
    auth.signOut().then(() => {
      console.log("Signed out")
    })
  }

  const { width } = useWindowSize()
  const contentWidth = Math.min(width, 500)

  return (
    <div className="container">
      <EventsAppNavBar
        title="Your events"
        rightElements={[
          <SmallButton
            title="Sign out"
            buttonTheme={ButtonTheme.MONOCHROME_OUTLINED}
            onClick={handleSignOut}
            style={{ padding: "4px 8px" }}
          />,
        ]}
      />

      <Helmet>
        <title>Your tickets | Mercado</title>
      </Helmet>
      
      <div className="content">
        <Spacer y={9} />
        <h1 className="header-l">Your events</h1>
        <Spacer y={3} />
        <p className="text-body-faded">
          Click on an event to view your tickets.
        </p>
        <Spacer y={3} />
        <h2 className="header-m">Upcoming</h2>
        <Spacer y={2} />
        {
          upcomingEvents ?
            (
              upcomingEvents.length > 0 ?
                upcomingEvents.map((event) => {
                  const ticketCount = event.products.reduce((ticketCount, product) => ticketCount + product.tickets.length, 0)

                  return (
                    <div key={event.id}>
                      <EventListing event={event} rightCornerText={`${ticketCount} tickets`} />
                      <Spacer y={3} />
                    </div>
                  )
                }) :
                <p className="text-body-faded">No upcoming events.</p>
            ) :
            <ShimmerThumbnail height={contentWidth - 32} />
          
        }

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
                <p className="text-body-faded">No past events.</p>
            ) :
            <ShimmerThumbnail height={contentWidth - 32} />
        }
        <Spacer y={8} />
      </div>
    </div>
  )
}
