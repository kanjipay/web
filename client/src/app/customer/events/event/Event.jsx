import { useEffect, useState } from "react"
import { Route, Routes, useLocation, useParams } from "react-router-dom"
import Collection from "../../../../enums/Collection"
import LoadingPage from "../../../../components/LoadingPage"
import EventPage from "./EventPage"
import { orderBy, where } from "firebase/firestore"
import Product from "../product/Product"

export default function Event({ merchant, user }) {
  const { eventId } = useParams()
  const location = useLocation()
  const [event, setEvent] = useState(location.state?.event)
  const [products, setProducts] = useState([])

  useEffect(() => {
    return Collection.PRODUCT.queryOnChange(
      setProducts,
      where("eventId", "==", eventId),
      orderBy("sortOrder", "asc")
    )
  }, [eventId])

  useEffect(() => {
    return Collection.EVENT.onChange(eventId, setEvent)
  }, [eventId])

  return event ?
    <Routes>
      <Route path="/" element={<EventPage merchant={merchant} event={event} products={products} />} />
      <Route path="/:productId/*" element={<Product merchant={merchant} event={event} user={user} />} />
    </Routes> :
    <LoadingPage />
}