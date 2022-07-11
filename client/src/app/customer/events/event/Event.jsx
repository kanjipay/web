import { useEffect, useState } from "react"
import { Route, Routes, useLocation, useParams } from "react-router-dom"
import Collection from "../../../../enums/Collection"
import LoadingPage from "../../../../components/LoadingPage"
import EventPage from "./EventPage"
import { documentId, orderBy, where } from "firebase/firestore"
import Product from "../product/Product"
import IconPage from "../../../../components/IconPage"
import Discover from "../../../../assets/icons/Discover"

export default function Event({ merchant, user }) {
  const { eventId } = useParams()
  const location = useLocation()
  const [event, setEvent] = useState(location.state?.event)
  const [products, setProducts] = useState(null)
  const [artists, setArtists] = useState(null)

  useEffect(() => {
    return Collection.EVENT.onChange(eventId, setEvent)
  }, [eventId])

  useEffect(() => {
    if (!event) {
      return
    }

    if (!event.artistIds || event.artistIds.length === 0) {
      setArtists([])
      return
    }

    return Collection.ARTIST.queryOnChange(
      setArtists,
      where(documentId(), "in", event.artistIds)
    )
  }, [event])

  useEffect(() => {
    return Collection.PRODUCT.queryOnChange(
      setProducts,
      where("eventId", "==", eventId),
      orderBy("sortOrder", "asc")
    )
  }, [eventId])

  if (event && products && artists) {
    if (event.isPublished) {
      return (
        <Routes>
          <Route
            path="/"
            element={
              <EventPage
                merchant={merchant}
                event={event}
                products={products}
                artists={artists}
              />
            }
          />
          <Route
            path="/:productId/*"
            element={<Product merchant={merchant} event={event} user={user} />}
          />
        </Routes>
      )
    } else {
      return (
        <IconPage
          Icon={Discover}
          title="Coming soon"
          body="The event organiser hasn't published this event yet. Try checking back later."
        />
      )
    }
  } else {
    return <LoadingPage />
  }
}
