import { useEffect, useState } from "react"
import { Route, Routes, useLocation, useParams } from "react-router-dom"
import Collection from "../../../../enums/Collection"
import LoadingPage from "../../../../components/LoadingPage"
import EventPage from "./EventPage"
import { onSnapshot, orderBy, query, where } from "firebase/firestore"
import TicketReaderPage from "../../../dashboard/events/TicketReaderPage"
import Product from "../product/Product"

export default function Event({ merchant, user }) {
  const { eventId } = useParams()
  const location = useLocation()
  const [event, setEvent] = useState(location.state?.event)
  const [products, setProducts] = useState([])

  useEffect(() => {
    const productsQuery = query(
      Collection.PRODUCT.ref,
      where("eventId", "==", eventId),
      orderBy("sortOrder", "asc")
    );

    onSnapshot(productsQuery, snapshot => {
      const p = snapshot.docs.map(doc => {
        return { id: doc.id, ...doc.data() }
      })

      setProducts(p)
    })
  }, [eventId])

  useEffect(() => {
    Collection.EVENT.onChange(eventId, e => {
      setEvent(e)
    })
  }, [eventId])

  return event ?
    <Routes>
      <Route path="/" element={<EventPage merchant={merchant} event={event} products={products} />} />
      <Route path="/:productId/*" element={<Product merchant={merchant} event={event} user={user} />} />
    </Routes> :
    <LoadingPage />
}