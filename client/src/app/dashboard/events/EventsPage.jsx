import { onSnapshot, orderBy, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Discover from "../../../assets/icons/Discover";
import IconActionPage from "../../../components/IconActionPage";
import IconPage from "../../../components/IconPage";
import LoadingPage from "../../../components/LoadingPage";
import Spacer from "../../../components/Spacer";
import Collection from "../../../enums/Collection";

export default function EventsPage() {
  const navigate = useNavigate()
  const { merchantId } = useParams()
  const [events, setEvents] = useState(null)

  useEffect(() => {
    const eventsQuery = query(
      Collection.EVENT.ref,
      where("merchantId", "==", merchantId),
      orderBy("startsAt", "desc")
    )

    const unsub = onSnapshot(eventsQuery, snapshot => {
      const events = snapshot.docs.map(doc => {
        return { id: doc.id, ...doc.data() }
      })

      setEvents(events)
    })

    return unsub
  })

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