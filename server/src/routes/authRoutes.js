import { Router } from 'express'
import { body } from 'express-validator'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { validateRequest } from '../middleware/validateRequest.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

function signToken(userId, role = 'user') {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured')
  }
  return jwt.sign({ id: userId, role }, process.env.JWT_SECRET, { expiresIn: '7d' })
}

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    verified: user.verified,
    role: user.role,
    status: user.status
  }
}

router.post(
  '/register',
  [
    body('name').trim().isLength({ min: 2 }).withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
  ],
  validateRequest,
  asyncHandler(async (req, res) => {
    const { name, email, password } = req.body
    const existing = await User.findOne({ email: email.toLowerCase() })
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' })
    }
    const passwordHash = await bcrypt.hash(password, 10)
    const user = await User.create({ name, email: email.toLowerCase(), passwordHash, verified: false, role: 'user' })
    const token = signToken(user.id, user.role)
    res.status(201).json({ user: publicUser(user), token })
  })
)

router.post(
  '/login',
  [body('email').isEmail(), body('password').notEmpty().withMessage('Password required')],
  validateRequest,
  asyncHandler(async (req, res) => {
    const { email, password } = req.body
    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      return res.status(404).json({ message: 'Account not found' })
    }
    const ok = await bcrypt.compare(password, user.passwordHash)
    if (!ok) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }
    if (user.status === 'suspended') {
      return res.status(403).json({ message: 'Account is suspended' })
    }
    if (!user.verified) {
      return res.status(403).json({ message: 'Please verify your email before logging in' })
    }
    const token = signToken(user.id, user.role)
    res.json({ user: publicUser(user), token })
  })
)

router.post(
  '/verify',
  [body('email').isEmail()],
  validateRequest,
  asyncHandler(async (req, res) => {
    const { email } = req.body
    const user = await User.findOneAndUpdate({ email: email.toLowerCase() }, { verified: true }, { new: true })
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    const token = signToken(user.id, user.role)
    res.json({ user: publicUser(user), token })
  })
)

router.get('/me', authenticate, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id)
  if (!user) return res.status(404).json({ message: 'User not found' })
  res.json({ user: publicUser(user) })
}))

export default router
