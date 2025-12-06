import mongoose from 'mongoose'

const ruleSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  body: { type: String, required: true, trim: true },
  published: { type: Boolean, default: true }
}, { timestamps: true })

export default mongoose.model('Rule', ruleSchema)

