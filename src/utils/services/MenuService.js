import { collection, doc, onSnapshot, query, where } from "firebase/firestore"
import { db } from "../FirebaseUtils"


export function fetchMerchant(merchantId, onComplete) {
  const merchantRef = doc(db, "Merchant", merchantId)

  return onSnapshot(merchantRef, onComplete)
}

export function fetchOpeningHours(merchantId, onComplete) {
  const merchantRef = doc(db, "Merchant", merchantId)
  const collectionRef = collection(db, "OpeningHourRange")
  const openHoursQuery = query(collectionRef, where("merchant", "==", merchantRef))

  return onSnapshot(openHoursQuery, onComplete)
}

export function fetchMenuSections(merchantId, onComplete) {
  const merchantRef = doc(db, "Merchant", merchantId)
  const collectionRef = collection(db, "MenuSection")
  const sectionsQuery = query(collectionRef, where("merchant", "==", merchantRef))

  return onSnapshot(sectionsQuery, onComplete)
}

export function fetchMenuItems(merchantId, onComplete) {
  const merchantRef = doc(db, "Merchant", merchantId)
  const collectionRef = collection(db, "MenuItem")
  const menuItemQuery = query(collectionRef, where("merchant", "==", merchantRef))

  return onSnapshot(menuItemQuery, onComplete)
}

