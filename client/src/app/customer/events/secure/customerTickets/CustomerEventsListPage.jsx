import Discover from "../../../../../assets/icons/Discover";
import { ButtonTheme } from "../../../../../components/CircleButton";
import IconPage from "../../../../../components/IconPage";
import LoadingPage from "../../../../../components/LoadingPage";
import SmallButton from "../../../../../components/SmallButton";
import Spacer from "../../../../../components/Spacer";
import { auth } from "../../../../../utils/FirebaseUtils";
import EventListing from "../../event/EventListing";
import EventsAppNavBar from "../EventsAppNavBar";
import { useEffect } from "react";
import { AnalyticsManager } from "../../../../../utils/AnalyticsManager";

export default function CustomerEventListPage({ events }) {
  let pageContents

  useEffect(() => {
    AnalyticsManager.main.logEvent("CustomerEventList")
  }, [])

  if (events) {
    if (events.length > 0) {
      pageContents = <div className="content">
        <Spacer y={9} />
        <h1 className="header-l">Upcoming events</h1>
        <Spacer y={3} />
        <p className="text-body-faded">Click on an event to view your tickets.</p>
        <Spacer y={3} />
        {
          events.map(event => {
            return <div key={event.id}>
              <EventListing event={event} />
              <Spacer y={3} />
            </div>
          })
        }
      </div>
    } else {
      pageContents = <IconPage
        Icon={Discover}
        title="No events yet"
        body="You haven't bought any event tickets yet. When you do, they'll appear here."
      />
    }
  } else {
    pageContents = <LoadingPage />
  }

  const handleSignOut = () => {
    auth.signOut().then(() => {
      console.log("Signed out")
    })
  }

  return <div className="container">
    <EventsAppNavBar
      title="Your events"
      rightElements={[<SmallButton title="Sign out" buttonTheme={ButtonTheme.MONOCHROME_OUTLINED} onClick={handleSignOut} style={{ padding: "4px 8px" }}/>]}
    />
    { pageContents }
  </div>
}