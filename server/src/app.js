import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import authRoutes from './routes/authRoutes.js'
import listingRoutes from './routes/listingRoutes.js'
import reportRoutes from './routes/reportRoutes.js'
import healthRoutes from './routes/healthRoutes.js'
import uploadRoutes from './routes/uploadRoutes.js'
import { errorHandler, notFound } from './middleware/errorHandler.js'

const app = express()
const __dirname = path.dirname(fileURLToPath(import.meta.url))

app.use(cors())
app.use(express.json({ limit: '5mb' }))
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

app.use('/api/health', healthRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/listings', listingRoutes)
app.use('/api/reports', reportRoutes)
app.use('/api/uploads', uploadRoutes)

app.use(notFound)
app.use(errorHandler)

export default app
