import fs from 'fs'
import dotenv from 'dotenv'
import app from './src/app.js'
import { connectDB } from './src/config/db.js'
import path from 'path'
import { fileURLToPath } from 'url'

// Load environment from server/.env when running from repo root
const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: new URL('./.env', import.meta.url) })

const PORT = process.env.PORT || 5000
const MONGODB_URI = process.env.MONGODB_URI
const uploadsDir = path.join(__dirname, 'uploads')

async function start() {
  try {
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir)
    }
    await connectDB(MONGODB_URI)
    app.listen(PORT, () => {
      console.log(`API server running on port ${PORT}`)
    })
  } catch (err) {
    console.error('Failed to start server:', err.message)
    process.exit(1)
  }
}

start()
