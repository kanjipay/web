import { orderBy, where } from "firebase/firestore"
import { useEffect, useState } from "react"
import { Route, Routes, useParams } from "react-router-dom"
import LoadingPage from "../../../../components/LoadingPage"
import Collection from "../../../../enums/Collection"
import CreateEventPage from "./CreateEventPage"
import Event from "./Event"
import EventRecurrencePage from "./EventRecurrencePage"
import EventsPage from "./EventsPage"

export default function Events({ merchant }) {
  const { merchantId } = useParams()
  const [events, setEvents] = useState(null)
  const [eventRecurrences, setEventRecurrences] = useState(null)

  useEffect(() => {
    const eventUnsub = Collection.EVENT.queryOnChange(
      setEvents,
      where("merchantId", "==", merchantId),
      orderBy("startsAt", "desc")
    )

    const eventRecurrenceUnsub = Collection.EVENT_RECURRENCE.queryOnChange(
      setEventRecurrences,
      where("merchantId", "==", merchantId)
    )

    return () => {
      eventUnsub()
      eventRecurrenceUnsub()
    }
  }, [merchantId])

  return events && eventRecurrences ? (
    <Routes>
      <Route path="/" element={<EventsPage events={events} eventRecurrences={eventRecurrences} />} />
      <Route path="create" element={<CreateEventPage />} />
      <Route
        path="e/:eventId/*"
        element={<Event events={events} merchant={merchant} eventRecurrences={eventRecurrences} />}
      />
      <Route
        path="er/:eventRecurrenceId"
        element={<EventRecurrencePage eventRecurrences={eventRecurrences} />}
      />
    </Routes>
  ) : (
    <LoadingPage />
  )
}
