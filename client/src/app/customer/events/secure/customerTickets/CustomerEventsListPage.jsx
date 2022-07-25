import Discover from "../../../../../assets/icons/Discover"
import { ButtonTheme } from "../../../../../components/ButtonTheme"
import IconPage from "../../../../../components/IconPage"
import LoadingPage from "../../../../../components/LoadingPage"
import SmallButton from "../../../../../components/SmallButton"
import Spacer from "../../../../../components/Spacer"
import { auth } from "../../../../../utils/FirebaseUtils"
import EventListing from "../../event/EventListing"
import EventsAppNavBar from "../EventsAppNavBar"
import { useEffect } from "react"
import { AnalyticsManager } from "../../../../../utils/AnalyticsManager"
import { Helmet } from "react-helmet-async"
import { dateFromTimestamp } from "../../../../../utils/helpers/time"

export default function CustomerEventListPage({ events }) {
  let pageContents

  useEffect(() => {
    AnalyticsManager.main.logEvent("CustomerEventList")
  }, [])

  const pastEvents = events.filter(event => dateFromTimestamp(event.endsAt) < new Date())
  const upcomingEvents = events.filter(event => dateFromTimestamp(event.endsAt) >= new Date())
  

  if (events) {
    if (events.length > 0) {
      pageContents = (
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
            upcomingEvents.length > 0 ?
              upcomingEvents.map((event) => {
                return (
                  <div key={event.id}>
                    <EventListing event={event} />
                    <Spacer y={3} />
                  </div>
                )
              }) :
              <p className="text-body-faded">No upcoming events.</p>
          }

          <Spacer y={4} />
          
          <h2 className="header-m">Past</h2>
          <Spacer y={2} />
          {
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
          }
        </div>
      )
    } else {
      pageContents = (
        <IconPage
          Icon={Discover}
          title="No events yet"
          body="You haven't bought any event tickets yet. When you do, they'll appear here."
        />
      )
    }
  } else {
    pageContents = <LoadingPage />
  }

  const handleSignOut = () => {
    auth.signOut().then(() => {
      console.log("Signed out")
    })
  }

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
      {pageContents}
    </div>
  )
}
