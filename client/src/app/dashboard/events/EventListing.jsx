import { isMobile } from "react-device-detect"
import { Link } from "react-router-dom"
import AsyncImage from "../../../components/AsyncImage"
import Spacer from "../../../components/Spacer"
import { getEventStorageRef } from "../../../utils/helpers/storage"
import { EventDetails } from "../../customer/events/event/EventPage"

export default function EventListing({ event }) {
  const { merchantId, title } = event

  const width = isMobile ? "100%" : 400

  const image = <AsyncImage
    imageRef={getEventStorageRef(merchantId, event.id, event.photo)}
    alt={event.title}
    style={{ width, aspectRatio: "2 / 1" }}
  />

  const contents = <div style={{ width }}>
    <h3 className="header-s" style={{ lineHeight: 1 }}>
      {title}
    </h3>
    <Spacer y={2} />
    <EventDetails event={event} />
    <Spacer y={2} />
    <p className="text-body-faded">{event.description}</p>
  </div>

  return (
    <Link to={`e/${event.id}`}>
      {
        isMobile ?
          <div>
            {image}
            <Spacer y={2} />
            {contents}
          </div> :
          <div style={{ display: "flex", columnGap: 32, height: 200 }}>
            {image}
            {contents}
          </div>
      }
      
    </Link>
  )
}
