import { isMobile } from "react-device-detect"
import { Link } from "react-router-dom"
import Clock from "../../../../assets/icons/Clock"
import Location from "../../../../assets/icons/Location"
import AsyncImage from "../../../../components/AsyncImage"
import CircleIcon from "../../../../components/CircleIcon"
import Spacer from "../../../../components/Spacer"
import { Colors } from "../../../../enums/Colors"
import { getEventRecurrenceStorageRef } from "../../../../utils/helpers/storage"

export function timeIntervalString(amount, interval) {
  if (amount === 1) {
    return interval.toLowerCase()
  } else {
    return `${amount} ${interval.toLowerCase()}s`
  }
}

export function timePeriodString(amount, interval) {
  return `${amount} ${interval.toLowerCase()}${amount === 1 ? "" : "s"}`
}

export default function EventRecurrenceListing({ eventRecurrence }) {
  const { merchantId, title } = eventRecurrence

  const width = isMobile ? "100%" : 400

  const image = <AsyncImage
    imageRef={getEventRecurrenceStorageRef(merchantId, eventRecurrence.id, eventRecurrence.photo)}
    alt={eventRecurrence.title}
    style={{ width, aspectRatio: "2 / 1" }}
  />

  const { interval, eventPublishInterval, address, description } = eventRecurrence

  const contents = <div style={{ width }}>
    <h3 className="header-s" style={{ lineHeight: 1 }}>
      {title}
    </h3>
    <Spacer y={2} />
    <div style={{ columnGap: 8, display: "flex" }}>
      <CircleIcon Icon={Clock} length={20} backgroundColor={Colors.CLEAR} />
      <p className="text-body">
        Every {timeIntervalString(interval.amount, interval.interval)}. 
        Publishes {timePeriodString(eventPublishInterval.amount, eventPublishInterval.interval)} in advance.
      </p>
    </div>
    <Spacer y={1} />
    <div style={{ columnGap: 8, display: "flex" }}>
      <CircleIcon
        Icon={Location}
        length={20}
        backgroundColor={Colors.CLEAR}
      />
      <p className="text-body">{address}</p>
    </div>
    <Spacer y={2} />
    <p className="text-body-faded">{description}</p>
  </div>

  return (
    <Link to={`er/${eventRecurrence.id}`}>
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
