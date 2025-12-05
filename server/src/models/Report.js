import mongoose from 'mongoose'

const reportSchema = new mongoose.Schema({
  type: { type: String, enum: ['user', 'listing', 'other'], required: true },
  targetId: { type: String, required: true },
  reason: { type: String, required: true, trim: true },
  by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  byEmail: { type: String }
}, { timestamps: true })

export default mongoose.model('Report', reportSchema)
