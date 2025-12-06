import { Router } from 'express'
import { body, param } from 'express-validator'
import Category from '../models/Category.js'
import { authenticate, requireAdmin } from '../middleware/auth.js'
import { validateRequest } from '../middleware/validateRequest.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const router = Router()

const DEFAULT_CATEGORIES = [
  { id: 1, name: 'Electronics' },
  { id: 2, name: 'Books' },
  { id: 3, name: 'Furniture' },
  { id: 4, name: 'Stationery' },
  { id: 5, name: 'Other' }
]

async function ensureSeeded() {
  const count = await Category.estimatedDocumentCount()
  if (count === 0) {
    await Category.insertMany(DEFAULT_CATEGORIES)
  }
}

router.get(
  '/',
  asyncHandler(async (req, res) => {
    await ensureSeeded()
    const categories = await Category.find().sort({ id: 1 })
    res.json({ categories })
  })
)

router.post(
  '/',
  authenticate,
  requireAdmin,
  [body('name').trim().isLength({ min: 2 }).withMessage('Name is required')],
  validateRequest,
  asyncHandler(async (req, res) => {
    await ensureSeeded()
    const last = await Category.findOne().sort({ id: -1 })
    const nextId = last ? last.id + 1 : 1
    const category = await Category.create({ id: nextId, name: req.body.name })
    res.status(201).json({ category })
  })
)

router.put(
  '/:id',
  authenticate,
  requireAdmin,
  [param('id').isInt(), body('name').trim().isLength({ min: 2 }).withMessage('Name is required')],
  validateRequest,
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id)
    const category = await Category.findOneAndUpdate({ id }, { name: req.body.name }, { new: true })
    if (!category) return res.status(404).json({ message: 'Category not found' })
    res.json({ category })
  })
)

router.delete(
  '/:id',
  authenticate,
  requireAdmin,
  [param('id').isInt()],
  validateRequest,
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id)
    const deleted = await Category.findOneAndDelete({ id })
    if (!deleted) return res.status(404).json({ message: 'Category not found' })
    res.status(204).send()
  })
)

export default router

