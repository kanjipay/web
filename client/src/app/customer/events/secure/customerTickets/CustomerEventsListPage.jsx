import Discover from "../../../../../assets/icons/Discover";
import { Colors } from "../../../../../components/CircleButton";
import IconPage from "../../../../../components/IconPage";
import LoadingPage from "../../../../../components/LoadingPage";
import Spacer from "../../../../../components/Spacer";
import EventListing from "../../event/EventListing";
import EventsAppNavBar from "../EventsAppNavBar";

export default function CustomerEventListPage({ events }) {
  let pageContents

  console.log(events)

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
        iconBackgroundColor={Colors.PRIMARY_LIGHT}
        iconForegroundColor={Colors.PRIMARY}
        title="No events yet"
        body="You haven't bought any event tickets yet. When you do, they'll appear here."
      />
    }
  } else {
    pageContents = <LoadingPage />
  }
  return <div className="container">
    <EventsAppNavBar
      title="Your events"
    />
    { pageContents }
  </div>
}