import { getEventStorageRef } from "../../../../utils/helpers/storage"
import { format } from 'date-fns'
import Listing from "../../../../components/Listing"
import { dateFromTimestamp } from "../../../../utils/helpers/time"

export default function EventListing({ event, linkPath = event.id }) {

  return <Listing
    imageRef={getEventStorageRef(event.merchantId, event.id, event.photo)}
    title={event.title}
    description={event.description}
    rightBubbleText={format(dateFromTimestamp(event.startsAt), "do MMM")}
    linkPath={linkPath}
    linkState={{ event }}
  />
}
