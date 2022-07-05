import { Link } from "react-router-dom"
import AsyncImage from "../../../components/AsyncImage"
import Spacer from "../../../components/Spacer"
import { getEventStorageRef } from "../../../utils/helpers/storage"
import { EventDetails } from "../../customer/events/event/EventPage"

export default function EventListing({ event }) {
  const { merchantId, title } = event

  return (
    <Link to={`e/${event.id}`}>
      <div style={{ display: "flex", columnGap: 32, height: 200 }}>
        <AsyncImage
          imageRef={getEventStorageRef(merchantId, event.id, event.photo)}
          alt={event.title}
          style={{ height: 200, width: 400 }}
        />
        <div style={{ width: 400 }}>
          <h3 className="header-s" style={{ lineHeight: 1 }}>
            {title}
          </h3>
          <Spacer y={2} />
          <EventDetails event={event} />
          <Spacer y={2} />
          <p className="text-body-faded">{event.description}</p>
        </div>
      </div>
    </Link>
  )
}
