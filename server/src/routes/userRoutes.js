import { Router } from 'express'
import { param, query } from 'express-validator'
import User from '../models/User.js'
import AdminLog from '../models/AdminLog.js'
import { authenticate, requireAdmin } from '../middleware/auth.js'
import { validateRequest } from '../middleware/validateRequest.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const router = Router()

// Admin: list users, optionally filtered by email/name query
router.get(
  '/',
  authenticate,
  requireAdmin,
  [query('q').optional().isString()],
  validateRequest,
  asyncHandler(async (req, res) => {
    const { q } = req.query
    const filter = {}
    if (q) {
      const regex = new RegExp(q, 'i')
      filter.$or = [{ email: regex }, { name: regex }]
    }
    const users = await User.find(filter).select('-passwordHash').sort({ createdAt: -1 })
    res.json({ users })
  })
)

async function logAdminAction(adminId, action, targetType, targetId, meta) {
  try {
    await AdminLog.create({ admin: adminId, action, targetType, targetId, meta })
  } catch {
    // logging failures should not break main flow
  }
}

// Admin: suspend user
router.patch(
  '/:id/suspend',
  authenticate,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status: 'suspended' },
      { new: true }
    ).select('-passwordHash')
    if (!user) return res.status(404).json({ message: 'User not found' })
    await logAdminAction(req.user.id, 'suspend_user', 'user', user.id, { email: user.email })
    res.json({ user })
  })
)

// Admin: reactivate user
router.patch(
  '/:id/reactivate',
  authenticate,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status: 'active' },
      { new: true }
    ).select('-passwordHash')
    if (!user) return res.status(404).json({ message: 'User not found' })
    await logAdminAction(req.user.id, 'reactivate_user', 'user', user.id, { email: user.email })
    res.json({ user })
  })
)

export default router
