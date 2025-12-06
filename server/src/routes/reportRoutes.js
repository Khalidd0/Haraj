import { Router } from 'express'
import { body, param } from 'express-validator'
import Report from '../models/Report.js'
import Listing from '../models/Listing.js'
import User from '../models/User.js'
import AdminLog from '../models/AdminLog.js'
import { authenticate, requireAdmin, requireVerified } from '../middleware/auth.js'
import { validateRequest } from '../middleware/validateRequest.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const router = Router()

router.post(
  '/',
  authenticate,
  requireVerified,
  [body('type').isIn(['user', 'listing', 'other']), body('targetId').notEmpty(), body('reason').isLength({ min: 5 })],
  validateRequest,
  asyncHandler(async (req, res) => {
    const payload = {
      type: req.body.type,
      targetId: req.body.targetId,
      reason: req.body.reason,
      by: req.user.id,
      byEmail: req.user.email
    }
    const report = await Report.create(payload)
    res.status(201).json({ report })
  })
)

router.get(
  '/',
  authenticate,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const reports = await Report.find().sort({ createdAt: -1 })
    res.json({ reports })
  })
)

async function logAdminAction(adminId, action, targetType, targetId, meta) {
  try {
    await AdminLog.create({ admin: adminId, action, targetType, targetId, meta })
  } catch {
    // ignore logging failures
  }
}

router.delete(
  '/:id',
  authenticate,
  requireAdmin,
  [param('id').isMongoId()],
  validateRequest,
  asyncHandler(async (req, res) => {
    const deleted = await Report.findByIdAndDelete(req.params.id)
    if (!deleted) return res.status(404).json({ message: 'Report not found' })
    await logAdminAction(req.user.id, 'dismiss_report', 'report', req.params.id)
    res.status(204).send()
  })
)

// Admin actions on reported items/users
router.post(
  '/:id/actions',
  authenticate,
  requireAdmin,
  [
    param('id').isMongoId(),
    body('action').isIn(['hide_listing', 'delete_listing', 'suspend_user'])
  ],
  validateRequest,
  asyncHandler(async (req, res) => {
    const report = await Report.findById(req.params.id)
    if (!report) return res.status(404).json({ message: 'Report not found' })

    const { action } = req.body

    if (action === 'hide_listing' || action === 'delete_listing') {
      if (report.type !== 'listing') {
        return res.status(400).json({ message: 'Report is not for a listing' })
      }
      const listing = await Listing.findById(report.targetId)
      if (!listing) return res.status(404).json({ message: 'Listing not found' })

      if (action === 'hide_listing') {
        listing.status = 'reserved'
        await listing.save()
        await logAdminAction(req.user.id, 'hide_listing', 'listing', listing.id, {
          reportId: report.id
        })
      } else if (action === 'delete_listing') {
        await listing.deleteOne()
        await logAdminAction(req.user.id, 'delete_listing', 'listing', report.targetId, {
          reportId: report.id
        })
      }
    }

    if (action === 'suspend_user') {
      if (report.type !== 'user') {
        return res.status(400).json({ message: 'Report is not for a user' })
      }
      const user = await User.findByIdAndUpdate(
        report.targetId,
        { status: 'suspended' },
        { new: true }
      )
      if (!user) return res.status(404).json({ message: 'User not found' })
      await logAdminAction(req.user.id, 'suspend_user_from_report', 'user', user.id, {
        reportId: report.id,
        email: user.email
      })
    }

    res.json({ ok: true })
  })
)

export default router
