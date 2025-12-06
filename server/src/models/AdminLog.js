import mongoose from 'mongoose'

const adminLogSchema = new mongoose.Schema({
  admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true, trim: true },
  targetType: { type: String, enum: ['user', 'listing', 'report', 'rule', 'category'], required: true },
  targetId: { type: String, required: true },
  meta: { type: Object }
}, { timestamps: true })

export default mongoose.model('AdminLog', adminLogSchema)

