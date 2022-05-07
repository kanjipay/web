import { onSnapshot, orderBy, query, where } from "firebase/firestore"
import { useEffect, useState } from "react"
import AsyncImage from "../../../../components/AsyncImage";
import NavBar from "../../../../components/NavBar";
import Spacer from "../../../../components/Spacer";
import Collection from "../../../../enums/Collection";
import { getMerchantStorageRef } from "../../../../utils/helpers/storage";
import EventListing from "../event/EventListing";
import EventsAppNavBar from "../secure/EventsAppNavBar";

export default function MerchantPage({ merchant }) {
  const merchantId = merchant.id
  const [events, setEvents] = useState([])

  useEffect(() => {
    const eventsQuery = query(
      Collection.EVENT.ref,
      where("merchantId", "==", merchantId),
      orderBy("startsAt", "desc")
    );

    const unsub = onSnapshot(eventsQuery, snapshot => {
      const e = snapshot.docs.map(doc => {
        return { id: doc.id, ...doc.data() }
      })

      setEvents(e)
    })

    return () => {
      unsub()
    }
  }, [merchantId])

  return <div className="container">
    <EventsAppNavBar
      title={merchant.displayName}
      transparentDepth={50}
      opaqueDepth={100}
    />

    <AsyncImage
      imageRef={getMerchantStorageRef(merchant.id, merchant.photo)}
      className="headerImage"
      alt={merchant.displayName}
    />

    <Spacer y={4} />

    <div className="content">
      <h1 className="header-l">{merchant.displayName}</h1>
      <Spacer y={1} />
      <p className="text-body">{merchant.tags.join(" · ")}</p>

      <Spacer y={4}/>

      <p className="text-body-faded">{merchant.description}</p>

      <Spacer y={4} />

      <h2 className="header-m">Upcoming events</h2>
      <Spacer y={2} />
      {
        events.map(event => {
          return <div key={event.id}>
            <EventListing event={event}  />
            <Spacer y={3} />
          </div>
        })
      }
    </div>
    
  </div>
}