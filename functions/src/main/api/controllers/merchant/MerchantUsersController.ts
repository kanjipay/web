import BaseController from "../../../../shared/BaseController";
import Collection from "../../../../shared/enums/Collection";
import { db } from "../../../../shared/utils/admin";
import { v4 as uuid } from "uuid"
import { addDays } from "date-fns";
import { firestore } from "firebase-admin";
import { fetchDocument } from "../../../../shared/utils/fetchDocument";
import { sendInvites } from "../../../../shared/utils/sendEmail";

export class MerchantUsersController extends BaseController {
  sendInvites = async (req, res, next) => {
    try {
      const userId = req.user.id
      const { merchantId } = req.params
      const { inviteData } = req.body

      const [
        { merchant, merchantError },
        { user, userError }
      ] = await Promise.all([
        fetchDocument(Collection.MERCHANT, merchantId),
        fetchDocument(Collection.USER, userId)
      ])

      const loadingError = merchantError || userError

      if (loadingError) {
        next(loadingError)
        return
      }

      const { firstName } = user
      const { displayName } = merchant

      const batch = db().batch()

      const inviteIds: string[] = []

      for (const inviteDatum of inviteData) {
        const { email } = inviteDatum
        const inviteId = uuid()
        inviteIds.push(inviteId)
        const docRef = db().collection(Collection.INVITE).doc(inviteId)

        batch.create(docRef, {
          email,
          invitingUserId: userId,
          merchantId,
          expiresAt: addDays(new Date(), 1),
          createdAt: firestore.FieldValue.serverTimestamp(),
          wasUsed: false
        })
      }

      const createInvites = batch.commit()

      const inviteDataWithIds = inviteData.map((datum, index) => {
        datum.inviteId = inviteIds[index]
        return datum
      })

      const sendInviteEmails = sendInvites(inviteDataWithIds, firstName, displayName)

      await Promise.all([
        createInvites,
        sendInviteEmails
      ])

      return res.status(200).json({});
    } catch (err) {
      next(err)
    }
  }

  getUsers = async (req, res, next) => {
    try {
      const { merchantId } = req.params

      const membershipsSnapshot = await db()
        .collection(Collection.MEMBERSHIP)
        .where("merchantId", "==", merchantId)
        .get()
      
      if (membershipsSnapshot.docs.length === 0) { return [] }

      const userIds = membershipsSnapshot.docs.map(doc => doc.data().userId)

      const usersSnapshot = await db()
        .collection(Collection.USER)
        .where(firestore.FieldPath.documentId(), "in", userIds)
        .get()

      const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

      res.status(200).json(users)
    } catch (err) {
      next(err)
    }
  }
}