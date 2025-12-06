import mongoose from 'mongoose'

const categorySchema = new mongoose.Schema({
  id: { type: Number, unique: true, required: true },
  name: { type: String, required: true, trim: true }
}, { timestamps: true })

export default mongoose.model('Category', categorySchema)

