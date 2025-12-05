import mongoose from 'mongoose'

export async function connectDB(uri) {
  if (!uri) {
    throw new Error('MONGODB_URI is not set')
  }
  await mongoose.connect(uri)
  mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err.message)
  })
  return mongoose.connection
}

export { mongoose }
export const Types = mongoose.Types
