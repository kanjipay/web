import { orderBy, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import AsyncImage from "../../components/AsyncImage";
import LoadingPage from "../../components/LoadingPage";
import Spacer from "../../components/Spacer";
import Collection from "../../enums/Collection";
import { getArtistStorageRef } from "../../utils/helpers/storage";
import EventListing from "./events/event/EventListing";
import EventsAppNavBar from "./events/secure/EventsAppNavBar";

export default function ArtistPage() {
  const { artistId } = useParams()

  const [artist, setArtist] = useState(null)
  const [events, setEvents] = useState(null)

  useEffect(() => {
    return Collection.ARTIST.onChange(artistId, setArtist)
  }, [artistId])

  useEffect(() => {
    return Collection.EVENT.queryOnChange(
      setEvents,
      where("artistIds", "array-contains", artistId),
      where("startsAt", ">", new Date()),
      where("isPublished", "==", true),
      orderBy("startsAt", "asc")
    )
  }, [artistId])

  if (artist && events) {
    return <div className="container">
      <EventsAppNavBar
        title={artist.name}
        transparentDepth={50}
        opaqueDepth={100}
      />

      <AsyncImage
        imageRef={getArtistStorageRef(artistId, artist.photo)}
        className="headerImage"
        style={{ height: 300 }}
        alt={artist.name}
      />

      <div className="content">
        <Spacer y={3} />
        <h1 className="header-l">{artist.name}</h1>
        <Spacer y={3} />
        <a href={artist.spotifyLink} target="_blank" rel="noreferrer">Spotify</a>
        <Spacer y={3} />
        {
          events.length > 0 && <div>
            <h2 className="header-m">Upcoming events</h2>
            <Spacer y={2} />
            {
              events.map(event => {
                return <div key={event.id}>
                  <EventListing event={event} linkPath={`/events/${event.merchantId}/${event.id}`} />
                  <Spacer y={3} />
                </div>
              })
            }
          </div>
        }
      </div>
    </div>
  } else {
    return <LoadingPage />
  }
  
}