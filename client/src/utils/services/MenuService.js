import { onSnapshot, orderBy, query, where } from "firebase/firestore";
import Collection from "../../enums/Collection";

export function fetchMerchant(merchantId, onComplete) {
  return onSnapshot(Collection.MERCHANT.docRef(merchantId), onComplete);
}

export function fetchOpeningHours(merchantId, onComplete) {
  const openHoursQuery = query(
    Collection.OPENING_HOUR_RANGE.ref,
    where("merchantId", "==", merchantId)
  );

  return onSnapshot(openHoursQuery, onComplete);
}

export function fetchMenuSections(merchantId, onComplete) {
  const sectionsQuery = query(
    Collection.MENU_SECTION.ref,
    where("merchantId", "==", merchantId),
    orderBy("sortOrder", "asc")
  );

  return onSnapshot(sectionsQuery, onComplete);
}

export function fetchMenuItems(merchantId, onComplete) {
  const menuItemQuery = query(
    Collection.MENU_ITEM.ref,
    where("merchantId", "==", merchantId),
    orderBy("sortOrder", "asc")
  );

  return onSnapshot(menuItemQuery, onComplete);
}
