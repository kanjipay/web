import express from 'express'
import { HttpError, HttpStatusCode } from './utils/errors'
import jwt from 'jsonwebtoken'
import { plaidClient } from './utils/plaid'
import sha256 from 'sha256'
import jwkToPem from "jwk-to-pem"
import PaymentAttemptStatus from './enums/PaymentAttemptStatus'
import { db } from './app'
import Collection from './enums/Collection'
import OrderStatus from './enums/OrderStatus'

const app = express()
const keyCache = new Map()

async function verify(req) {
  console.log(req.headers)
  const token = req.headers["plaid-verification"]

  if (!token) { return false }

  const decoded = jwt.decode(token, { complete: true })
  console.log(decoded)
  const { header, payload } = decoded

  if (header.alg !== "ES256") { return false }

  const currKeyId = header.kid

  console.log(keyCache)
  
  if (!keyCache.has(currKeyId)) {
    let keyIdsToUpdate = []

    keyCache.forEach((keyId, key) => {
      if (key.expired_at != null) {
        keyIdsToUpdate.push(keyId)
      }
    })

    keyIdsToUpdate.push(currKeyId)

    for (keyId of keyIdsToUpdate) {
      const keyResponse = await plaidClient.webhookVerificationKeyGet({ key_id: currKeyId })
        .catch(err => {
          console.log(err)
          return false
        })

      const key = keyResponse.key

      console.log(key)

      keyCache.set(keyId, key)
    }
  }

  console.log(keyCache)

  if (!keyCache.has(currKeyId)) {
    return false
  }

  const key = keyCache.get(currKeyId)

  if (key.expired_at != null) {
    return false
  }

  try {
    const decodedAndVerified = jwt.verify(token, key)
  } catch (err) {
    console.log(err)
    return false
  }

  const issuedAtSeconds = payload.iat
  const claimedBodyHash = payload.request_body_sha256

  console.log(issuedAtSeconds)
  console.log(claimedBodyHash)

  if (!claimedBodyHash || !issuedAtSeconds || !(typeof issuedAtSeconds === "number")) {
    return false
  }

  const issuedAt = new Date(issuedAtSeconds * 1000)
  const fiveMinsAgo = new Date(Date.now() - (5 * 60 * 1000))

  console.log(issuedAt)
  console.log(fiveMinsAgo)

  if (issuedAt < fiveMinsAgo) { return false }

  const bodyHash = sha256(req.body)

  console.log(bodyHash)

  if (claimedBodyHash !== bodyHash) { return false }

  return true
}

app.post('/', async (req, res, next) => {
  const isValid = await verify(req)

  if (!isValid) {
    next(new HttpError(HttpStatusCode.UNAUTHORIZED))
    return
  }

  const { payment_id, new_payment_status } = req.body

  const retryableErrors = [
    "PAYMENT_STATUS_FAILED",
    "PAYMENT_STATUS_BLOCKED"
  ]

  const nonRetryableErrors = [
    "PAYMENT_STATUS_INSUFFICIENT_FUNDS",
    "PAYMENT_STATUS_REJECTED"
  ]

  const paymentStatusMap = {
    "PAYMENT_STATUS_INPUT_NEEDED": PaymentAttemptStatus.PENDING,
    "PAYMENT_STATUS_INITIATED": PaymentAttemptStatus.SUCCESSFUL,
    "PAYMENT_STATUS_CANCELLED": PaymentAttemptStatus.CANCELLED,
    "PAYMENT_STATUS_FAILED": PaymentAttemptStatus.FAILED,
    "PAYMENT_STATUS_BLOCKED": PaymentAttemptStatus.FAILED,
    "PAYMENT_STATUS_INSUFFICIENT_FUNDS": PaymentAttemptStatus.FAILED,
    "PAYMENT_STATUS_REJECTED": PaymentAttemptStatus.FAILED
  }

  if (new_payment_status in paymentStatusMap) {
    const paymentAttemptSnapshot = await db
      .collection(Collection.PAYMENT_ATTEMPT.name)
      .where("payment_id", "==", payment_id)
      .limit(1)
      .get()
      .catch(new ErrorHandler(HttpStatusCode.INTERNAL_SERVER_ERROR, next).handle)

    if (paymentAttemptSnapshot.docs.length === 0) {
      next(new HttpError(HttpStatusCode.NOT_FOUND))
      return
    }

    const paymentAttemptDoc = paymentAttemptSnapshot.docs[0]
    const paymentAttemptStatus = paymentStatusMap[new_payment_status]

    const update = { status: paymentAttemptStatus }

    if (paymentAttemptStatus === PaymentAttemptStatus.FAILED) {
      update["failure_reason"] = new_payment_status
    }

    await db
      .doc(paymentAttemptDoc.ref)
      .set(update, { merge: true })
      .catch(new ErrorHandler(HttpStatusCode.INTERNAL_SERVER_ERROR, next).handle)

    if (paymentAttemptStatus === PaymentAttemptStatus.SUCCESSFUL) {
      const orderId = paymentAttemptDoc.data().order_id

      await db
        .collection(Collection.ORDER.name)
        .doc(orderId)
        .set({ status: OrderStatus.PAID }, { merge: true })
        .catch(new ErrorHandler(HttpStatusCode.INTERNAL_SERVER_ERROR, next).handle)
    }
  }

  return res.sendStatus(200)
})

export default app