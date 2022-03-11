import { ref } from "firebase/storage";
import { storage } from "../FirebaseUtils";

export function getMerchantStorageRef(merchantId, filename) {
  return ref(storage, `merchants/${merchantId}/${filename}`)
}

export function getMenuItemStorageRef(merchantId, itemId, filename) {
  return ref(storage, `merchants/${merchantId}/menu_items/${itemId}/${filename}`)
}