import { Router } from 'express'
import { body, param } from 'express-validator'
import Report from '../models/Report.js'
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

router.delete(
  '/:id',
  authenticate,
  requireAdmin,
  [param('id').isMongoId()],
  validateRequest,
  asyncHandler(async (req, res) => {
    const deleted = await Report.findByIdAndDelete(req.params.id)
    if (!deleted) return res.status(404).json({ message: 'Report not found' })
    res.status(204).send()
  })
)

export default router
