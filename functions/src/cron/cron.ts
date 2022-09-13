import { logger } from "firebase-functions/v1"
import { abandonOldOrders } from "./abandonOldOrders"
import { deleteTicketsForIncompletePayments } from "./deleteTicketsForIncompletePayments"
import { publishScheduledEvents } from "./publishScheduledEvents"
import { backupFirestore } from "./backupFirestore"
import { retargetOrders } from "./retargetingEmail"
import { createSalesSummary } from "./salesSummary"


export const cronFunction = async (context) => {
  try {
    logger.log("Running cron function")

    await Promise.all([
      abandonOldOrders(context),
      deleteTicketsForIncompletePayments(context),
      publishScheduledEvents(context),
    ])
  } catch (err) {
    logger.error(err)
  }
}

export const cronFunctionDaily = async (context) => {
  try {
    logger.log(context)
    logger.log("Running daily cron function")
    await Promise.all([
      backupFirestore(),
      retargetOrders(),
      createSalesSummary(),

    ])
  } catch (err) {
    logger.error(err)
  }
}