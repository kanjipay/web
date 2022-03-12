import express from 'express'
import { errorHandler } from '../middleware/errorHandler'
import routes from './routes'
import cors from 'cors'

const app = express()

const corsInstance = cors({ origin: "*" })
app.use(corsInstance)
app.options('*', corsInstance) // Think this is needed for preflight requests

// These are needed to read request body (as JSON or urlencoded)
app.use(express.json())
app.use(express.urlencoded())

app.use('/', routes)

app.use(errorHandler)

export default app