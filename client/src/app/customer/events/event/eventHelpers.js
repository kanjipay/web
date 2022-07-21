import { dateFromTimestamp } from "../../../../utils/helpers/time"
import { isSameDay, format } from "date-fns"

export function eventTimeString(event) {
  const startsAt = dateFromTimestamp(event.startsAt)
  const endsAt = dateFromTimestamp(event.endsAt)

  if (isSameDay(startsAt, endsAt)) {
    return `${format(startsAt, "do MMM")} ${format(
      startsAt,
      "H:mm"
    )} - ${format(endsAt, "H:mm")}`
  } else {
    return `${format(startsAt, "do MMM H:mm")} - ${format(
      endsAt,
      "do MMM H:mm"
    )}`
  }
}

export function generateGoogleMapsLink(event) {
  return `https://www.google.com/maps/search/?api=1&query=${event.address
    .replaceAll(/[^0-9a-z\s]/gi, "")
    .replaceAll(" ", "+")}`
}
