import { useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import Clock from "../../../../../assets/icons/Clock";
import Location from "../../../../../assets/icons/Location";
import User from "../../../../../assets/icons/User";
import AsyncImage from "../../../../../components/AsyncImage";
import { Colors } from "../../../../../components/CircleButton";
import CircleIcon from "../../../../../components/CircleIcon";
import LoadingPage from "../../../../../components/LoadingPage";
import Spacer from "../../../../../components/Spacer";
import { getEventStorageRef } from "../../../../../utils/helpers/storage";
import { eventTimeString, generateGoogleMapsLink } from "../../event/eventHelpers";
import EventsAppNavBar from "../EventsAppNavBar";
import Ticket from "./Ticket";

export default function CustomerEventPage({ events }) {
  const { eventId } = useParams()

  if (events) {
    const event = events.find(event => event.id === eventId)

    return <div className="container">
      <EventsAppNavBar
        title={event.title}
        transparentDepth={50}
        opaqueDepth={100}
        backPath=".."
      />

      <AsyncImage
        imageRef={getEventStorageRef(event.merchantId, eventId, event.photo)}
        className="headerImage"
        alt={event.title}
      />

      <Spacer y={4} />

      <div className="content">
        <h1 className="header-l">{event.title}</h1>
        <Spacer y={2} />
        <div style={{ columnGap: 8, display: "flex" }}>
          <CircleIcon Icon={Clock} length={20} backgroundColor={Colors.CLEAR} />
          <p className="text-body">{eventTimeString(event)}</p>
        </div>
        <Spacer y={1} />
        <div style={{ columnGap: 8, display: "flex" }}>
          <CircleIcon Icon={Location} length={20} backgroundColor={Colors.CLEAR} />
          <p className="text-body">
            {`${event.address} · `}
            <a href={generateGoogleMapsLink(event)} target="_blank" rel="noreferrer">Get directions</a>
          </p>
        </div>
        <Spacer y={1} />
        <div style={{ columnGap: 8, display: "flex" }}>
          <CircleIcon Icon={User} length={20} backgroundColor={Colors.CLEAR} />
          <p className="text-body"><Link to={`/events/${event.merchantId}`}>View organiser</Link></p>
        </div>
        <Spacer y={4} />
        <p className="text-body-faded">{event.description}</p>

        <Spacer y={4} />

        <h1 className="header-m">Your tickets</h1>
        <Spacer y={2} />
        
        {
          event.products.map(product => {
            return <div key={product.id}>
              {
                product.tickets.map((ticket, index) => {
                  return <div key={ticket.id}>
                    <Ticket ticket={ticket} product={product} index={index + 1} />
                    <Spacer y={2} />
                  </div>
                })
              }
            </div>
          })
        }
      </div>
    </div>
  } else {
    return <LoadingPage />
  }

  
}