export function dateFromTimestamp(timestamp) {
  const seconds = timestamp.seconds ?? timestamp._seconds
  return new Date(seconds * 1000)
}