import { logger } from "firebase-functions/v1"
import Collection from "../shared/enums/Collection"
import { db } from "../shared/utils/admin"
import { nDaysAgo } from "../shared/utils/time"

export const sendRetargetingEmails = async (context) => {
  try {
    logger.log("Find Orders for Retargeting Email")
    const latestDate = nDaysAgo(1)
    const earliestDate =  nDaysAgo(2)
    const abandonedOrderSnapshot = await db()
      .collection(Collection.ORDER)
      .where("publishScheduledAt", "<", latestDate)
      .where("publishScheduledAt", ">", earliestDate)
      .where("status", "==", "ABANDONED")
      .get()
    logger.log("Got abandoned orders", {
      orderCount: abandonedOrderSnapshot.docs.length,
    })
    logger.log("Events published")
  } catch (err) {
    logger.error(err)
  }
}
