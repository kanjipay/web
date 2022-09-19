import Collection from "../enums/Collection"
import { db } from "../utils/admin"
import { firestore } from "firebase-admin"
import { fetchDocumentsInArray } from "../utils/fetchDocumentsInArray"

export async function getMerchantUsers(merchantId: string){
    const membershipsSnapshot = await db()
    .collection(Collection.MEMBERSHIP)
    .where("merchantId", "==", merchantId)
    .get()
  if (membershipsSnapshot.docs.length === 0) {
    return []
  }
  const userIds = membershipsSnapshot.docs.map((doc) => doc.data().userId)
  const users = await fetchDocumentsInArray(
    db().collection(Collection.USER),
    firestore.FieldPath.documentId(),
    userIds
  )
  return users
}
