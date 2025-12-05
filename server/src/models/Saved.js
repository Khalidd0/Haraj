import mongoose from 'mongoose'

const savedSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  listingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true }
}, { timestamps: true })

savedSchema.index({ userId: 1, listingId: 1 }, { unique: true })

export default mongoose.model('Saved', savedSchema)
