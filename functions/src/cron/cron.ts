import { logger } from "firebase-functions/v1"
import { abandonOldOrders } from "./abandonOldOrders"
import { deleteTicketsForIncompletePayments } from "./deleteTicketsForIncompletePayments"
import { publishScheduledEvents } from "./publishScheduledEvents"

export const cronFunction = async (context) => {
  try {
    logger.log("Running cron function");

    await Promise.all([
      abandonOldOrders(context),
      deleteTicketsForIncompletePayments(context),
      publishScheduledEvents(context),
    ])
  } catch (err) {
    logger.error(err)
  }
}
