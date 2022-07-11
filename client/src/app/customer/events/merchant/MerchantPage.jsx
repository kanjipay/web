import { orderBy, where } from "firebase/firestore"
import { useEffect, useState } from "react"
import AsyncImage from "../../../../components/AsyncImage"
import Spacer from "../../../../components/Spacer"
import Collection from "../../../../enums/Collection"
import { AnalyticsManager } from "../../../../utils/AnalyticsManager"
import { getMerchantStorageRef } from "../../../../utils/helpers/storage"
import EventListing from "../event/EventListing"
import EventsAppNavBar from "../secure/EventsAppNavBar"
import { Helmet } from "react-helmet-async"

export default function MerchantPage({ merchant }) {
  const merchantId = merchant.id
  const [events, setEvents] = useState([])
  const [pastEvents, setPastEvents] = useState([])

  useEffect(() => {
    AnalyticsManager.main.viewPage("TicketMerchant", { merchantId })
  }, [merchantId])

  useEffect(() => {
    return Collection.EVENT.queryOnChange(
      setEvents,
      where("merchantId", "==", merchantId),
      where("endsAt", ">", new Date()),
      where("isPublished", "==", true),
      orderBy("endsAt", "desc")
    )
  }, [merchantId])

  useEffect(() => {
    return Collection.EVENT.queryOnChange(
      setPastEvents,
      where("merchantId", "==", merchantId),
      where("endsAt", "<=", new Date()),
      where("isPublished", "==", true),
      orderBy("endsAt", "desc")
    )
  }, [merchantId])

  return (
    <div className="container">
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

      <Helmet>
        <title>{merchant.displayName} | Mercado</title>
      </Helmet>

      <Spacer y={4} />

      <div className="content">
        <h1 className="header-l">{merchant.displayName}</h1>

        <Spacer y={4} />

        <p className="text-body-faded">{merchant.description}</p>

        <Spacer y={4} />

        <h2 className="header-m">Upcoming events</h2>
        <Spacer y={2} />
        {
          events.length > 0 ?
            events.map((event) => {
              return (
                <div key={event.id}>
                  <EventListing event={event} />
                  <Spacer y={3} />
                </div>
              )
            }) :
            <p>No upcoming events</p>
        }

        <Spacer y={3} />

        <h2 className="header-m">Past events</h2>
        <Spacer y={2} />
        {
          pastEvents.length > 0 ?
            pastEvents.map((event) => {
              return (
                <div key={event.id}>
                  <EventListing event={event} />
                  <Spacer y={3} />
                </div>
              )
            }) :
            <p>No past events</p>
        }

        <Spacer y={6} />
      </div>
    </div>
  )
}
