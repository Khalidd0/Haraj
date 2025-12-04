import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  verified: { type: Boolean, default: false },
  role: { type: String, enum: ['user', 'admin'], default: 'user' }
}, { timestamps: true })

userSchema.methods.toSafeJSON = function toSafeJSON() {
  return { id: this.id, name: this.name, email: this.email, verified: this.verified, role: this.role, createdAt: this.createdAt }
}

export default mongoose.model('User', userSchema)
