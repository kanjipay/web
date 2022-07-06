import { format } from "date-fns";

export function dateFromTimestamp(timestamp) {
  const seconds = timestamp.seconds ?? timestamp._seconds;
  return new Date(seconds * 1000);
}

export function longFormat(date: Date) {
  return `${format(date, "MMM d")} at ${format(date, "HH:mm")}`;
}
