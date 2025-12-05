import { Router } from 'express'
import { param } from 'express-validator'
import Saved from '../models/Saved.js'
import Listing from '../models/Listing.js'
import { authenticate, requireVerified } from '../middleware/auth.js'
import { validateRequest } from '../middleware/validateRequest.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const router = Router()

router.get(
  '/',
  authenticate,
  requireVerified,
  asyncHandler(async (req, res) => {
    const saved = await Saved.find({ userId: req.user.id }).lean()
    res.json({ saved: saved.map(s => ({ listingId: s.listingId })) })
  })
)

router.post(
  '/:listingId',
  authenticate,
  requireVerified,
  [param('listingId').isMongoId()],
  validateRequest,
  asyncHandler(async (req, res) => {
    const listing = await Listing.findById(req.params.listingId)
    if (!listing) return res.status(404).json({ message: 'Listing not found' })
    const existing = await Saved.findOne({ userId: req.user.id, listingId: listing.id })
    if (!existing) {
      await Saved.create({ userId: req.user.id, listingId: listing.id })
      listing.metrics.saves = (listing.metrics.saves || 0) + 1
      await listing.save()
    }
    res.status(201).json({ saved: { listingId: listing.id } })
  })
)

router.delete(
  '/:listingId',
  authenticate,
  requireVerified,
  [param('listingId').isMongoId()],
  validateRequest,
  asyncHandler(async (req, res) => {
    const listing = await Listing.findById(req.params.listingId)
    if (!listing) return res.status(404).json({ message: 'Listing not found' })
    const removed = await Saved.findOneAndDelete({ userId: req.user.id, listingId: listing.id })
    if (removed) {
      listing.metrics.saves = Math.max(0, (listing.metrics.saves || 0) - 1)
      await listing.save()
    }
    res.status(204).send()
  })
)

export default router
