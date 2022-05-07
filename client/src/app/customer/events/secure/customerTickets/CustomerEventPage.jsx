import { useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import AsyncImage from "../../../../../components/AsyncImage";
import LoadingPage from "../../../../../components/LoadingPage";
import Spacer from "../../../../../components/Spacer";
import { getEventStorageRef } from "../../../../../utils/helpers/storage";
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
        
        {
          event.products.map(product => {
            return <div key={product.id}>
              <Spacer y={4} />
              <h3 className="header-s">{product.title}</h3>
              <Spacer y={2} />
              {
                product.tickets.map(ticket => {
                  return <div key={ticket.id}>
                    <Ticket ticket={ticket}/>
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