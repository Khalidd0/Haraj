import { Router } from 'express'
import { body, param } from 'express-validator'
import Rule from '../models/Rule.js'
import { authenticate, requireAdmin } from '../middleware/auth.js'
import { validateRequest } from '../middleware/validateRequest.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const router = Router()

// Public rules for all users (only published)
router.get(
  '/public',
  asyncHandler(async (req, res) => {
    const rules = await Rule.find({ published: true }).sort({ createdAt: -1 })
    res.json({ rules })
  })
)

// Admin: list all rules
router.get(
  '/',
  authenticate,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const rules = await Rule.find().sort({ createdAt: -1 })
    res.json({ rules })
  })
)

// Admin: create rule
router.post(
  '/',
  authenticate,
  requireAdmin,
  [
    body('title').trim().isLength({ min: 3 }).withMessage('Title is required'),
    body('body').trim().isLength({ min: 10 }).withMessage('Body is required'),
    body('published').optional().isBoolean()
  ],
  validateRequest,
  asyncHandler(async (req, res) => {
    const rule = await Rule.create({
      title: req.body.title,
      body: req.body.body,
      published: req.body.published !== undefined ? req.body.published : true
    })
    res.status(201).json({ rule })
  })
)

// Admin: update rule
router.put(
  '/:id',
  authenticate,
  requireAdmin,
  [
    param('id').isMongoId(),
    body('title').optional().trim().isLength({ min: 3 }),
    body('body').optional().trim().isLength({ min: 10 }),
    body('published').optional().isBoolean()
  ],
  validateRequest,
  asyncHandler(async (req, res) => {
    const update = {}
    ;['title', 'body', 'published'].forEach((field) => {
      if (req.body[field] !== undefined) update[field] = req.body[field]
    })
    const rule = await Rule.findByIdAndUpdate(req.params.id, update, { new: true })
    if (!rule) return res.status(404).json({ message: 'Rule not found' })
    res.json({ rule })
  })
)

// Admin: delete rule
router.delete(
  '/:id',
  authenticate,
  requireAdmin,
  [param('id').isMongoId()],
  validateRequest,
  asyncHandler(async (req, res) => {
    const deleted = await Rule.findByIdAndDelete(req.params.id)
    if (!deleted) return res.status(404).json({ message: 'Rule not found' })
    res.status(204).send()
  })
)

export default router

