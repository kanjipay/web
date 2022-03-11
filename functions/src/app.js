import express from 'express'
import ordersRoutes from './routes/ordersRoutes'
import paymentAttemptsRoutes from './routes/paymentAttemptsRoutes'
import cors from 'cors'
import { checkFirebaseAuthToken } from './middleware/auth'
import { HttpStatusCode } from './utils/errors'
import * as admin from 'firebase-admin'
import { errorHandler } from './middleware/errorHandler'

const app = express()

const corsInstance = cors({ origin: process.env.CLIENT_URL })
app.use(corsInstance)
app.options('*', corsInstance) // Think this is needed for preflight requests

// These are needed to read request body (as JSON or urlencoded)
app.use(express.json())
app.use(express.urlencoded())

app.use('/orders', ordersRoutes)
app.use('/payment-attempts', paymentAttemptsRoutes)

// This is called whenever an error is raised in an endpoint
app.use(errorHandler)

// Do this to enable protected routes
// app.use('/orders', checkFirebaseAuthToken, ordersRoutes)

const env = process.env.ENVIRONMENT || "DEV"
const serviceAccount = require(`./service-account-${env}.json`)
const credential = admin.credential.cert(serviceAccount)

admin.initializeApp({ credential })

export const db = admin.firestore()
export const auth = admin.auth()

export default app