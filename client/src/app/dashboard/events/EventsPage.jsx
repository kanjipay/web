import { orderBy, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Discover from "../../../assets/icons/Discover";
import IconActionPage from "../../../components/IconActionPage";
import LoadingPage from "../../../components/LoadingPage";
import Spacer from "../../../components/Spacer";
import Collection from "../../../enums/Collection";

export default function EventsPage() {
  const { merchantId } = useParams()
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
    console.log(123)
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
    contents = <div>
      List of events
    </div>
  }

  return <div>
    <Spacer y={5} />
    <h1 className="header-l">Events</h1>
    <Spacer y={3} />
    {contents}
  </div>
}