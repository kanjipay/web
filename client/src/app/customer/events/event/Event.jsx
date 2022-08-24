import { useEffect, useState } from "react"
import { Route, Routes, useLocation, useParams } from "react-router-dom"
import Collection from "../../../../enums/Collection"
import LoadingPage from "../../../../components/LoadingPage"
import EventPage from "./EventPage"
import { documentId, orderBy, where } from "firebase/firestore"
import Product from "../product/Product"
import IconPage from "../../../../components/IconPage"
import Cross from "../../../../assets/icons/Cross"
import { Colors } from "../../../../enums/Colors"

export default function Event({ merchant, user }) {
  const { eventId } = useParams()
  const location = useLocation()
  const [event, setEvent] = useState(location.state?.event)
  const [products, setProducts] = useState(null)
  const [artists, setArtists] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    return Collection.EVENT.onChange(eventId, event => {
      if (event) {
        setEvent(event)
      } else {
        setError({
          title: "Event not found",
          body: "We couldn't find that event. Please double check you have the right link."
        })
      }
    })
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
  } else if (error) {
    return <IconPage
      Icon={Cross}
      iconBackgroundColor={Colors.RED_LIGHT}
      iconForegroundColor={Colors.RED}
      title={error.title}
      body={error.body}
    />
  } else {
    return <LoadingPage />
  }
}
