import { differenceInMinutes } from "date-fns";
import Collection from "../../../shared/enums/Collection";
import { db } from "../../../shared/utils/admin";

const membershipCache = new Map();

export async function authenticateMerchant(req, res, next) {
  const { merchantId } = req.params;
  const userId = req.user.id;

  const cacheKey = `merchantId:${merchantId},userId:${userId}`;

  if (membershipCache.has(cacheKey)) {
    const data = membershipCache.get(cacheKey);
    const { isValid, cachedAt } = data;

    if (isValid && differenceInMinutes(cachedAt, new Date()) < 60) {
      next();
      return;
    }
  }

  const snapshot = await db()
    .collection(Collection.MEMBERSHIP)
    .where("userId", "==", userId)
    .where("merchantId", "==", merchantId)
    .get();

  const isValid = snapshot.docs.length === 1;

  membershipCache.set(cacheKey, { isValid, cachedAt: new Date() });

  if (isValid) {
    next();
  } else {
    res.status(403).send("Unauthorized")
  }
}
