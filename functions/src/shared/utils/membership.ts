import { firestore } from "firebase-admin"
import { logger } from "firebase-functions/v1"
import Collection from "../enums/Collection"
import { auth, db } from "./admin"

export enum OrganisationRole {
  ADMIN = "ADMIN",
  EDITOR = "EDITOR",
  VIEWER = "VIEWER",
  TICKET_INSPECTOR = "TICKET_INSPECTOR",
}

export async function createMembership(
  userId: string,
  merchantId: string,
  merchantName: string,
  role: OrganisationRole,
  setCustomClaims: boolean = true
) {
  logger.log("Creating membership", { userId, merchantId, role })

  await db()
    .collection(Collection.MEMBERSHIP)
    .doc(`${merchantId}:${userId}`)
    .set({
      userId,
      merchantId,
      merchantName,
      lastUsedAt: firestore.FieldValue.serverTimestamp(),
      role,
    })

  logger.log("Membership doc created, editing user claims")

  const membershipSnapshot = await db()
    .collection(Collection.MEMBERSHIP)
    .where("userId", "==", userId)
    .get()

  logger.log("Got user's memberships", {
    membershipCount: membershipSnapshot.docs.length,
  })

  const memberships: any[] = membershipSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }))

  if (setCustomClaims) {
    const claims = memberships.reduce((claims, membership) => {
      const { role, merchantId } = membership
      claims[merchantId] = role
      return claims
    }, {})
    logger.log("setting user claims", { claims })
    await auth().setCustomUserClaims(userId, claims)
  }

}
