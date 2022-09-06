import { format } from "date-fns"
import { Timestamp } from "firebase/firestore";

export function dateFromTimestamp(timestamp) {
  const seconds = timestamp.seconds ?? timestamp._seconds
  return new Date(seconds * 1000)
}

export function longFormat(date: Date) {
  return `${format(date, "MMM d")} at ${format(date, "HH:mm")}`
}


export function formatDateWithZone(timestamp: Timestamp, tz: string = 'sv') {
  var s = timestamp.toDate().toLocaleString("en-US", {timeZone: "Europe/Belfast"});
  var a = s.split(/\D/);
  return a[2] + '-' + a[1] + '-' + a[0] + 'T' + a[4] + ':' + a[5] + ':' + a[6];
}
