import mongoose from 'mongoose'

const offerSchema = new mongoose.Schema({
  by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  byName: { type: String },
  price: { type: Number, required: true, min: 1 },
  status: { type: String, enum: ['Pending', 'Accepted', 'Declined'], default: 'Pending' },
  at: { type: Date, default: Date.now }
}, { _id: true })

const listingSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0 },
  categoryId: { type: Number, required: true },
  condition: { type: String, enum: ['New', 'Like New', 'Very Good', 'Good', 'Acceptable'], default: 'Good' },
  zoneId: { type: Number, required: true },
  pickupNote: { type: String, trim: true },
  images: { type: [String], default: [] },
  seller: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: String,
    email: String
  },
  status: { type: String, enum: ['active', 'reserved', 'sold'], default: 'active' },
  metrics: {
    views: { type: Number, default: 0 },
    saves: { type: Number, default: 0 },
    chats: { type: Number, default: 0 }
  },
  offers: { type: [offerSchema], default: [] }
}, { timestamps: true })

listingSchema.index({ title: 'text', description: 'text' })

export default mongoose.model('Listing', listingSchema)
