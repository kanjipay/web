import { useEffect, useState } from "react"
import { Route, Routes, useLocation, useParams } from "react-router-dom"
import Collection from "../../../../enums/Collection"
import LoadingPage from "../../../../components/LoadingPage"
import EventPage from "./EventPage"
import { orderBy, where } from "firebase/firestore"
import Product from "../product/Product"
import IconPage from "../../../../components/IconPage"
import Discover from "../../../../assets/icons/Discover"

export default function Event({ merchant, user }) {
  const { eventId } = useParams()
  const location = useLocation()
  const [event, setEvent] = useState(location.state?.event)
  const [products, setProducts] = useState([])

  useEffect(() => {
    return Collection.PRODUCT.queryOnChange(
      setProducts,
      where("eventId", "==", eventId),
      where("isPublished", "==", true),
      orderBy("sortOrder", "asc")
    )
  }, [eventId])

  useEffect(() => {
    return Collection.EVENT.onChange(eventId, setEvent)
  }, [eventId])

  if (!event) {
    return <LoadingPage />
  } else if (!event.isPublished) {
    return <IconPage
      Icon={Discover}
      title="Coming soon"
      body="The event organiser hasn't published this event yet. Try checking back later."
    />
  } else {
    return <Routes>
      <Route path="/" element={<EventPage merchant={merchant} event={event} products={products} />} />
      <Route path="/:productId/*" element={<Product merchant={merchant} event={event} user={user} />} />
    </Routes>
  }
}