import { useEffect, useState } from "react"
import { Route, Routes } from "react-router-dom"
import LoadingPage from "../../../../../components/LoadingPage"
import { NetworkManager } from "../../../../../utils/NetworkManager"
import CustomerEventPage from "./CustomerEventPage"
import CustomerEventListPage from "./CustomerEventsListPage"

export default function CustomerTickets() {
  const [events, setEvents] = useState(null)

  useEffect(() => {
    NetworkManager.get("/tickets").then((res) => {
      const { events } = res.data
      setEvents(events)
    })
  }, [])

  return (
    <Routes>
      <Route path="/" element={<CustomerEventListPage events={events} />} />
      <Route
        path="/:eventId"
        element={<CustomerEventPage events={events} />}
      />
    </Routes>
  )
}
