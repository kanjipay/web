import { firestore } from "firebase-admin";
import Collection from "../../shared/enums/Collection";
import { db } from "../../shared/utils/admin";
import { addCustomClaims } from "../../shared/utils/auth";

export enum OrganisationRole {
  ADMIN = "ADMIN",
  EDITOR = "EDITOR",
  VIEWER = "VIEWER",
  TICKET_INSPECTOR = "TICKET_INSPECTOR"
}

export async function createMembership(userId: string, merchantId: string, merchantName: string, role: OrganisationRole) {
  const createMembershipObject = db()
    .collection(Collection.MEMBERSHIP)
    .doc(`${merchantId}:${userId}`)
    .set({
      userId,
      merchantId,
      merchantName,
      lastUsedAt: firestore.FieldValue.serverTimestamp(),
      role
    })

  await Promise.all([
    createMembershipObject,
    addCustomClaims(userId, { [merchantId]: role })
  ])
}