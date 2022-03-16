import { onSnapshot, orderBy, query, where } from "firebase/firestore";
import Collection from "../../enums/Collection";

export function fetchMerchantByUserId(userId, onComplete) {
  const fetchMerchantByUserIdQuery = query(
    Collection.MERCHANT.ref,
    where("user_id", "==", userId)
  );

  return onSnapshot(fetchMerchantByUserIdQuery, onComplete);
}

export function fetchMerchantOrders(merchantId, onComplete) {
  const fetchMerchantOrdersQuery = query(
    Collection.ORDER.ref,
    where("status", "==", "PAID"),
    where("merchant_id", "==", merchantId),
    orderBy("created_at")
  );
  return onSnapshot(fetchMerchantOrdersQuery, onComplete);
}
