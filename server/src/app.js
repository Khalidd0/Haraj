import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import authRoutes from './routes/authRoutes.js'
import listingRoutes from './routes/listingRoutes.js'
import reportRoutes from './routes/reportRoutes.js'
import healthRoutes from './routes/healthRoutes.js'
import uploadRoutes, { serveRouter as uploadServeRoutes } from './routes/uploadRoutes.js'
import savedRoutes from './routes/savedRoutes.js'
import categoryRoutes from './routes/categoryRoutes.js'
import ruleRoutes from './routes/ruleRoutes.js'
import userRoutes from './routes/userRoutes.js'
import { errorHandler, notFound } from './middleware/errorHandler.js'

const app = express()
const __dirname = path.dirname(fileURLToPath(import.meta.url))

app.use(cors())
app.use(express.json({ limit: '5mb' }))

app.use('/api/health', healthRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/listings', listingRoutes)
app.use('/api/reports', reportRoutes)
app.use('/api/uploads', uploadRoutes)
app.use('/api/saved', savedRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/rules', ruleRoutes)
app.use('/api/users', userRoutes)
app.use('/uploads', uploadServeRoutes)

app.use(notFound)
app.use(errorHandler)

export default app
