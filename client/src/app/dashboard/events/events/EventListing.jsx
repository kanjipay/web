import { isMobile } from "react-device-detect"
import { Link } from "react-router-dom"
import Clock from "../../../../assets/icons/Clock"
import Location from "../../../../assets/icons/Location"
import AsyncImage from "../../../../components/AsyncImage"
import CircleIcon from "../../../../components/CircleIcon"
import Spacer from "../../../../components/Spacer"
import { Colors } from "../../../../enums/Colors"
import { getEventStorageRef } from "../../../../utils/helpers/storage"
import { eventTimeString } from "../../../customer/events/event/eventHelpers"

export default function EventListing({ event }) {
  const { title } = event

  const width = isMobile ? "100%" : 400

  const image = <AsyncImage
    imageRef={getEventStorageRef(event, event.photo) }
    alt={event.title}
    style={{ width, aspectRatio: "2 / 1" }}
  />

  const contents = <div style={{ width }}>
    <h3 className="header-s" style={{ lineHeight: 1 }}>{title}</h3>
    <Spacer y={2} />
    <div style={{ columnGap: 8, display: "flex" }}>
      <CircleIcon Icon={Clock} length={20} backgroundColor={Colors.CLEAR} />
      <p className="text-body">{eventTimeString(event)}</p>
    </div>
    <Spacer y={1} />
    <div style={{ columnGap: 8, display: "flex" }}>
      <CircleIcon
        Icon={Location}
        length={20}
        backgroundColor={Colors.CLEAR}
      />
      <p className="text-body">{event.address}</p>
    </div>
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
