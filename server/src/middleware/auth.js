import jwt from 'jsonwebtoken'
import User from '../models/User.js'

function unauthorized(res, message = 'Unauthorized') {
  return res.status(401).json({ message })
}

export async function authenticate(req, res, next) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return unauthorized(res, 'Missing bearer token')
  }

  const token = header.split(' ')[1]
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id).select('-passwordHash')
    if (!user) {
      return unauthorized(res, 'User not found')
    }
    req.user = { id: user.id, email: user.email, name: user.name, role: user.role, verified: user.verified }
    next()
  } catch (err) {
    return unauthorized(res, 'Invalid or expired token')
  }
}

export function requireVerified(req, res, next) {
  if (!req.user?.verified) {
    return res.status(403).json({ message: 'Email must be verified' })
  }
  next()
}

export function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' })
  }
  next()
}
