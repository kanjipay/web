import { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import LoadingPage from "../../../../../components/LoadingPage";
import Spacer from "../../../../../components/Spacer"
import { ApiName, NetworkManager } from "../../../../../utils/NetworkManager";
import EventListing from "../../event/EventListing";
import CustomerEventPage from "./CustomerEventPage";
import CustomerEventListPage from "./CustomerEventsListPage";

export default function CustomerTickets() {
  const [events, setEvents] = useState(null)

  useEffect(() => {
    NetworkManager.get(ApiName.ONLINE_MENU, "/tickets").then(res => {
      const { events } = res.data
      setEvents(events)
    })
  }, [])

  if (events) {
    return <Routes>
      <Route path="/" element={<CustomerEventListPage events={events} />} />
      <Route path="/:eventId" element={<CustomerEventPage events={events}/>} />
    </Routes>
  } else {
    return <LoadingPage />
  }
}