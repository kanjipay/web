import { auth } from "./admin";

export async function addCustomClaims(userId: string, claims: Object) {
  const user = await auth().getUser(userId)
  const existingClaims = user.customClaims

  await auth().setCustomUserClaims(userId, {
    ...existingClaims,
    ...claims
  })
}