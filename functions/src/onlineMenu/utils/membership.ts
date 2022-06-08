import { firestore } from "firebase-admin";
import Collection from "../../shared/enums/Collection";
import { auth, db } from "../../shared/utils/admin";

export enum OrganisationRole {
  ADMIN = "ADMIN",
  EDITOR = "EDITOR",
  VIEWER = "VIEWER",
  TICKET_INSPECTOR = "TICKET_INSPECTOR"
}

export async function createMembership(userId: string, merchantId: string, merchantName: string, role: OrganisationRole) {
  await db()
    .collection(Collection.MEMBERSHIP)
    .doc(`${merchantId}:${userId}`)
    .set({
      userId,
      merchantId,
      merchantName,
      lastUsedAt: firestore.FieldValue.serverTimestamp(),
      role
    })

  const membershipSnapshot = await db()
    .collection(Collection.MEMBERSHIP)
    .where("userId", "==", userId)
    .get()

  const memberships: any[] = membershipSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

  const claims = memberships.reduce((claims, membership) => {
    const { role, merchantId } = membership
    claims[merchantId] = role
    return claims
  }, {})

  await auth().setCustomUserClaims(userId, claims)
}