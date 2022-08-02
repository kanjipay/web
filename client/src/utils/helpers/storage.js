import { ref } from "firebase/storage"
import { storage } from "../FirebaseUtils"

export function getMerchantStorageRef(merchantId, filename) {
  if (!filename) { return null }
  return ref(storage, `merchants/${merchantId}/${filename}`)
}

export function getMenuItemStorageRef(merchantId, itemId, filename) {
  if (!filename) { return null }
  return ref(
    storage,
    `merchants/${merchantId}/menu_items/${itemId}/${filename}`
  )
}

export function getEventStorageRef(event, filename) {
  if (!filename) { return null }
  const { merchantId, eventRecurrenceId, id: eventId } = event

  if (eventRecurrenceId) {
    return getEventRecurrenceStorageRef(merchantId, eventRecurrenceId, filename)
  } else {
    return ref(storage, `merchants/${merchantId}/events/${eventId}/${filename}`)
  }
}

export function getEventRecurrenceStorageRef(merchantId, eventRecurrenceId, filename) {
  if (!filename) { return null }
  return ref(storage, `merchants/${merchantId}/eventRecurrences/${eventRecurrenceId}/${filename}`)
}

export function getArtistStorageRef(artistId, filename) {
  if (!filename) { return null }
  return ref(storage, `artists/${artistId}/${filename}`)
}
