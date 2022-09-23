import { logger } from "firebase-functions/v1"
import { db } from "../shared/utils/admin"
import Collection from "../shared/enums/Collection"
import { createMembership } from "../shared/utils/membership"
import { OrganisationRole } from "../shared/utils/membership"

export const addMembershipsToUsers = async (snapshot, context) => {
  try {
    const {email} = snapshot.data()
    const userId = snapshot.id
    const memberships =  await db().collection(Collection.MEMBERSHIP).where("email", "==", email).get()
    const membershipData = memberships.docs.map((doc) => {
        return {merchantId:doc.data().merchantId,merchantName:doc.data().displayName}
    })
    const ids = membershipData.map(membership => membership.merchantId)
    const deduplicated = membershipData.filter(({merchantId}, index) => !ids.includes(merchantId, index + 1))
    console.log({membershipData,deduplicated})
    deduplicated.forEach(async (merchantDatum) =>{
        const {merchantId, merchantName} = merchantDatum
        await createMembership(userId, merchantId,merchantName ,OrganisationRole.ADMIN)
    })
  } catch (err) {
    logger.error(err)
  }
}