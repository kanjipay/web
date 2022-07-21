import { where } from "firebase/firestore"
import { useEffect, useState } from "react"
import { Route, Routes, useParams } from "react-router-dom"
import Collection from "../../../enums/Collection"
import CheckerPage from "./CheckerPage"
import EventPage from "./EventPage"
import GuestlistPage from "./GuestlistPage"

export default function Event({ events, merchant }) {
  const { eventId } = useParams()
  const event = events.find((e) => e.id === eventId)
  const [products, setProducts] = useState(null)

  useEffect(() => {
    return Collection.PRODUCT.queryOnChange(
      setProducts,
      where("eventId", "==", eventId)
    )
  }, [eventId])

  return (
    <Routes>
      <Route
        path="/"
        element={
          <EventPage event={event} products={products} merchant={merchant} />
        }
      />
      <Route path="/guestlist" element={<GuestlistPage event={event} />} />
      <Route path="/checker" element={<CheckerPage event={event} />} />
    </Routes>
  )
}
