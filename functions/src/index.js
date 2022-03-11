import * as functions from 'firebase-functions'
import app from './app'
import { plaidWebhook } from './plaidWebhook'

export const api = functions.https.onRequest(app)
export const webhook = functions.https.onRequest(plaidWebhook)