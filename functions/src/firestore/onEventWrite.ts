import { logger } from "firebase-functions/v1"
import { notifyIfPublished } from "./notifyIfPublished"
import { sendEventChangeNotificationIfNeeded } from "./sendEventChangeNotificationIfNeeded"

export const onEventWrite = async (change, context) => {
  try {
    await notifyIfPublished(change, context)
    await sendEventChangeNotificationIfNeeded(change, context)
  } catch (err) {
    logger.error(err)
  }
}