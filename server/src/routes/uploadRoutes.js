import { Router } from 'express'
import multer from 'multer'
import { Readable } from 'stream'
import { Types, mongoose } from '../config/db.js'
import { authenticate, requireVerified } from '../middleware/auth.js'

const apiRouter = Router()
const serveRouter = Router()

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image uploads are allowed'))
    }
    cb(null, true)
  }
})

function getBucket() {
  if (!mongoose.connection?.db) throw new Error('Database not connected')
  return new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: 'uploads' })
}

async function saveToGridFS(file) {
  const bucket = getBucket()
  const safeName = file.originalname.replace(/[^a-zA-Z0-9\.\-_]/g, '_') || 'upload'
  const uploadStream = bucket.openUploadStream(safeName, { contentType: file.mimetype })
  const stream = new Readable()
  stream.push(file.buffer)
  stream.push(null)
  await new Promise((resolve, reject) => {
    stream.pipe(uploadStream).on('error', reject).on('finish', resolve)
  })
  return uploadStream.id
}

apiRouter.post('/', authenticate, requireVerified, upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' })
    const id = await saveToGridFS(req.file)
    const url = `/uploads/${id}`
    res.status(201).json({ url, id })
  } catch (err) {
    next(err)
  }
})

serveRouter.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    if (!Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid file id' })
    const bucket = getBucket()
    const files = await bucket.find({ _id: new Types.ObjectId(id) }).toArray()
    if (!files || !files.length) return res.status(404).json({ message: 'File not found' })
    const file = files[0]
    res.set('Content-Type', file.contentType || 'application/octet-stream')
    bucket.openDownloadStream(file._id).pipe(res)
  } catch (err) {
    next(err)
  }
})

export { apiRouter, serveRouter }
export default apiRouter
