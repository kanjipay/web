import { ref } from "firebase/storage"
import { storage } from "../FirebaseUtils"

export function getMerchantStorageRef(merchantId, filename) {
  return ref(storage, `merchants/${merchantId}/${filename}`)
}

export function getMenuItemStorageRef(merchantId, itemId, filename) {
  return ref(
    storage,
    `merchants/${merchantId}/menu_items/${itemId}/${filename}`
  )
}

export function getEventStorageRef(merchantId, eventId, filename) {
  return ref(storage, `merchants/${merchantId}/events/${eventId}/${filename}`)
}

export function getArtistStorageRef(artistId, filename) {
  return ref(storage, `artists/${artistId}/${filename}`)
}
