import { firestore } from "firebase-admin"
import BaseController from "../../../shared/BaseController"
import Collection from "../../../shared/enums/Collection"
import { db } from "../../../shared/utils/admin"
import { HttpError, HttpStatusCode } from "../../../shared/utils/errors"
import { fetchDocument } from "../../../shared/utils/fetchDocument"
import {
  createMembership,
  OrganisationRole,
} from "../../../shared/utils/membership"
import { dateFromTimestamp } from "../../../shared/utils/time"

export class InvitesController extends BaseController {
  acceptInvite = async (req, res, next) => {
    try {
      const { inviteId } = req.params;
      const userId = req.user.id;

      const { invite, inviteError } = await fetchDocument(
        Collection.INVITE,
        inviteId,
        { wasUsed: false }
      )

      if (inviteError) {
        next(inviteError);
        return;
      }

      if (dateFromTimestamp(invite.expiresAt) < new Date()) {
        const errorMessage = "That invite has expired"
        next(
          new HttpError(HttpStatusCode.BAD_REQUEST, errorMessage, errorMessage)
        )
        return
      }

      const { merchantId } = invite;

      const { merchant, merchantError } = await fetchDocument(
        Collection.MERCHANT,
        merchantId
      )

      if (merchantError) {
        next(merchantError);
        return;
      }

      const { displayName } = merchant;

      const updateInvite = db()
        .collection(Collection.INVITE)
        .doc(inviteId)
        .update({
          wasUsed: true,
          usedAt: firestore.FieldValue.serverTimestamp(),
        })

      await Promise.all([
        updateInvite,
        createMembership(
          userId,
          merchantId,
          displayName,
          OrganisationRole.ADMIN
        ),
      ])

      return res.sendStatus(200);
    } catch (err) {
      next(err);
    }
  }
}
