import { orderBy, where } from "firebase/firestore"
import { useEffect, useState } from "react"
import { Route, Routes, useParams } from "react-router-dom"
import LoadingPage from "../../../components/LoadingPage"
import Collection from "../../../enums/Collection"
import CreateEventPage from "./CreateEventPage"
import Event from "./Event"
import EventsPage from "./EventsPage"

export default function Events() {
  const { merchantId } = useParams()
  const [events, setEvents] = useState(null)

  useEffect(() => {
    return Collection.EVENT.queryOnChange(
      setEvents,
      where("merchantId", "==", merchantId),
      orderBy("startsAt", "desc")
    )
  }, [merchantId])

  return events ? <Routes>
    <Route path="/" element={<EventsPage events={events} />} />
    <Route path="create" element={<CreateEventPage />} />
    <Route path="e/:eventId/*" element={<Event events={events} />} />
  </Routes> :
  <LoadingPage />
}