import mongoose from 'mongoose'

const messageSchema = new mongoose.Schema({
  listingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
  from: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  to: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fromName: { type: String },
  text: { type: String, required: true, trim: true },
  type: { type: String, enum: ['message', 'offer', 'status'], default: 'message' },
  at: { type: Date, default: Date.now }
}, { timestamps: true })

export default mongoose.model('Message', messageSchema)
