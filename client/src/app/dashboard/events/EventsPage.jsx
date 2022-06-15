import { orderBy, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Discover from "../../../assets/icons/Discover";
import Breadcrumb from "../../../components/Breadcrumb";
import IconActionPage from "../../../components/IconActionPage";
import LoadingPage from "../../../components/LoadingPage";
import MainButton from "../../../components/MainButton";
import Spacer from "../../../components/Spacer";
import Collection from "../../../enums/Collection";
import { dateFromTimestamp } from "../../../utils/helpers/time";
import EventListing from "./EventListing";

export default function EventsPage() {
  const { merchantId } = useParams()
  const navigate = useNavigate()
  const [events, setEvents] = useState(null)

  useEffect(() => {
    return Collection.EVENT.queryOnChange(
      setEvents,
      where("merchantId", "==", merchantId),
      orderBy("startsAt", "desc")
    )
  }, [merchantId])

  let contents

  const handleCreateNewEvent = () => {
    navigate("create")
  }

  if (!events) {
    contents = <LoadingPage />
  } else if (events.length === 0) {
    contents = <IconActionPage
      Icon={Discover}
      title="No events yet"
      body="If you want to create a new one, you're in the right place!"
      primaryAction={handleCreateNewEvent}
      primaryActionTitle="Create new event"
    />
  } else {
    const currentDate = new Date()
    const upcomingEvents = events.filter(event => dateFromTimestamp(event.endsAt) >= currentDate)
    const pastEvents = events.filter(event => dateFromTimestamp(event.endsAt) < currentDate)

    contents = <div style={{ display: "grid", columnGap: 48, rowGap: 24, gridTemplateColumns: "1fr", boxSizing: "border-box" }}>
      {
        upcomingEvents.length > 0 && <div>
          <h3 className="header-m">Upcoming</h3>
          <Spacer y={3} />
          {
            upcomingEvents.map(event => <div key={event.id}>
              <EventListing event={event} />
              <Spacer y={3} />
            </div>)
          }
        </div>
      }
      {
        pastEvents.length > 0 && <div>
          <h3 className="header-m">Past</h3>
          <Spacer y={3} />
          {
            pastEvents.map(event => <div key={event.id}>
              <EventListing event={event} />
              <Spacer y={3} />
            </div>)
          }
        </div>
      }
      
    </div>
  }

  return <div>
    <Spacer y={2} />
    <Breadcrumb pageData={[
      { title: "Events" },
    ]} />
    <Spacer y={2} />
    <div style={{ display: "flex"}}>
      <h1 className="header-l">Events</h1>
      <div className="flex-spacer"></div>
      <MainButton 
        title="Create an event" 
        onClick={handleCreateNewEvent}
        style={{ padding: "0 16px" }}
      />
    </div>
    
    <Spacer y={3} />
    {contents}
  </div>
}