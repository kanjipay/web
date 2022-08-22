import { getEventStorageRef } from "../../../../utils/helpers/storage"
import { format } from "date-fns"
import Listing from "../../../../components/Listing"
import { dateFromTimestamp } from "../../../../utils/helpers/time"

export default function EventListing({ event, linkPath = event.id, rightCornerText, ...props }) {
  return (
    <Listing
      imageRef={getEventStorageRef(event, event.photo)}
      title={event.title}
      description={event.description}
      rightBubbleText={format(dateFromTimestamp(event.startsAt), "do MMM")}
      rightCornerText={rightCornerText}
      linkPath={linkPath}
      linkState={{ event }}
      test-name="event-listing"
      {...props}
    />
  )
}
