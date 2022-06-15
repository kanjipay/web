import { logger } from "firebase-functions/v1"
import { abandonOldOrders } from "./abandonOldOrders"
import { deleteTicketsForIncompletePayments } from "./deleteTicketsForIncompletePayments"

export const cronFunction = async context => {
  try {
    logger.log("Running cron function")

    await abandonOldOrders(context)
    await deleteTicketsForIncompletePayments(context)
  } catch (err) {
    console.log(err)
  }
}