import { Router } from 'express'
import { body, param, query } from 'express-validator'
import Listing from '../models/Listing.js'
import User from '../models/User.js'
import { authenticate, requireVerified } from '../middleware/auth.js'
import { validateRequest } from '../middleware/validateRequest.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import Message from '../models/Message.js'

const router = Router()

const listingValidators = [
  body('title').trim().isLength({ min: 3 }).withMessage('Title required'),
  body('description').trim().isLength({ min: 10 }).withMessage('Description required'),
  body('price').isFloat({ gt: 0 }).withMessage('Price must be greater than 0'),
  body('categoryId').isInt({ gt: 0 }).withMessage('categoryId required'),
  body('condition').isIn(['New', 'Like New', 'Very Good', 'Good', 'Acceptable']).withMessage('Invalid condition'),
  body('zoneId').isInt({ gt: 0 }).withMessage('zoneId required'),
  body('pickupNote').optional().isString().trim(),
  body('images').optional().isArray().withMessage('images must be an array of URLs')
]

router.get(
  '/',
  [
    query('categoryId').optional().isInt(),
    query('zoneId').optional().isInt(),
    query('status').optional().isIn(['active', 'reserved', 'sold']),
    query('sellerId').optional().isString(),
    query('q').optional().isString()
  ],
  validateRequest,
  asyncHandler(async (req, res) => {
    const { categoryId, zoneId, status, q, sellerId } = req.query
    const filter = {}
    if (categoryId) filter.categoryId = Number(categoryId)
    if (zoneId) filter.zoneId = Number(zoneId)
    if (status) filter.status = status
    if (sellerId) filter['seller.id'] = sellerId
    if (q) filter.$text = { $search: q }
    const listings = await Listing.find(filter).sort({ createdAt: -1 })
    res.json({ listings })
  })
)

router.get(
  '/:id',
  [param('id').isMongoId()],
  validateRequest,
  asyncHandler(async (req, res) => {
    const listing = await Listing.findById(req.params.id)
    if (!listing) return res.status(404).json({ message: 'Listing not found' })
    res.json({ listing })
  })
)

router.post(
  '/',
  authenticate,
  requireVerified,
  listingValidators,
  validateRequest,
  asyncHandler(async (req, res) => {
    const seller = await User.findById(req.user.id)
    if (!seller) return res.status(401).json({ message: 'Seller not found' })
    const payload = {
      title: req.body.title,
      description: req.body.description,
      price: req.body.price,
      categoryId: req.body.categoryId,
      condition: req.body.condition,
      zoneId: req.body.zoneId,
      pickupNote: req.body.pickupNote,
      images: Array.isArray(req.body.images) && req.body.images.length > 0 ? req.body.images : ['https://images.unsplash.com/photo-1518779578993-ec3579fee39f'],
      seller: { id: seller.id, name: seller.name, email: seller.email }
    }
    const listing = await Listing.create(payload)
    res.status(201).json({ listing })
  })
)

router.patch(
  '/:id',
  authenticate,
  requireVerified,
  [
    param('id').isMongoId(),
    body('title').optional().isLength({ min: 3 }),
    body('description').optional().isLength({ min: 10 }),
    body('price').optional().isFloat({ gt: 0 }),
    body('categoryId').optional().isInt({ gt: 0 }),
    body('condition').optional().isIn(['New', 'Like New', 'Very Good', 'Good', 'Acceptable']),
    body('zoneId').optional().isInt({ gt: 0 }),
    body('pickupNote').optional().isString().trim(),
    body('images').optional().isArray(),
    body('status').optional().isIn(['active', 'reserved', 'sold'])
  ],
  validateRequest,
  asyncHandler(async (req, res) => {
    const listing = await Listing.findById(req.params.id)
    if (!listing) return res.status(404).json({ message: 'Listing not found' })
    if (listing.seller.id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only the seller or admin can update this listing' })
    }
    const fields = ['title', 'description', 'price', 'categoryId', 'condition', 'zoneId', 'pickupNote', 'status', 'images']
    fields.forEach((f) => {
      if (req.body[f] !== undefined) {
        listing[f] = req.body[f]
      }
    })
    await listing.save()
    res.json({ listing })
  })
)

router.delete(
  '/:id',
  authenticate,
  requireVerified,
  [param('id').isMongoId()],
  validateRequest,
  asyncHandler(async (req, res) => {
    const listing = await Listing.findById(req.params.id)
    if (!listing) return res.status(404).json({ message: 'Listing not found' })
    if (listing.seller.id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only the seller or admin can delete this listing' })
    }
    await listing.deleteOne()
    res.status(204).send()
  })
)

router.post(
  '/:id/metrics',
  [param('id').isMongoId(), body('metric').isIn(['views', 'saves', 'chats'])],
  validateRequest,
  asyncHandler(async (req, res) => {
    const listing = await Listing.findById(req.params.id)
    if (!listing) return res.status(404).json({ message: 'Listing not found' })
    const key = req.body.metric
    listing.metrics[key] = (listing.metrics[key] || 0) + 1
    await listing.save()
    res.json({ metrics: listing.metrics })
  })
)

router.post(
  '/:id/messages',
  authenticate,
  requireVerified,
  [param('id').isMongoId(), body('text').isLength({ min: 1 }), body('to').optional().isMongoId()],
  validateRequest,
  asyncHandler(async (req, res) => {
    const listing = await Listing.findById(req.params.id)
    if (!listing) return res.status(404).json({ message: 'Listing not found' })
    const isSeller = listing.seller.id.toString() === req.user.id
    if (isSeller && !req.body.to) {
      return res.status(400).json({ message: 'Recipient required for seller messages' })
    }
    const to = isSeller ? req.body.to : listing.seller.id
    await Message.create({
      listingId: listing.id,
      from: req.user.id,
      to,
      fromName: req.user.name,
      text: req.body.text,
      type: 'message'
    })
    listing.metrics.chats = (listing.metrics.chats || 0) + 1
    await listing.save()
    res.status(201).json({ ok: true })
  })
)

router.get(
  '/:id/messages',
  authenticate,
  requireVerified,
  [param('id').isMongoId(), query('buyerId').optional().isMongoId()],
  validateRequest,
  asyncHandler(async (req, res) => {
    const listing = await Listing.findById(req.params.id)
    if (!listing) return res.status(404).json({ message: 'Listing not found' })
    const isSeller = listing.seller.id.toString() === req.user.id
    const filter = { listingId: listing.id }
    if (isSeller) {
      if (req.query.buyerId) {
        filter.$or = [{ from: req.query.buyerId }, { to: req.query.buyerId }]
      }
    } else {
      filter.$or = [{ from: req.user.id }, { to: req.user.id }]
    }
    const messages = await Message.find(filter).sort({ at: 1, createdAt: 1 })
    res.json({ messages })
  })
)

router.post(
  '/:id/offers',
  authenticate,
  requireVerified,
  [param('id').isMongoId(), body('price').isFloat({ gt: 0 })],
  validateRequest,
  asyncHandler(async (req, res) => {
    const listing = await Listing.findById(req.params.id)
    if (!listing) return res.status(404).json({ message: 'Listing not found' })
    const offer = { by: req.user.id, byName: req.user.name, price: req.body.price, status: 'Pending' }
    listing.offers.push(offer)
    listing.metrics.chats = (listing.metrics.chats || 0) + 1
    await listing.save()
    res.status(201).json({ offers: listing.offers })
  })
)

router.patch(
  '/:id/offers/:offerId',
  authenticate,
  requireVerified,
  [param('id').isMongoId(), param('offerId').isMongoId(), body('status').isIn(['Pending', 'Accepted', 'Declined'])],
  validateRequest,
  asyncHandler(async (req, res) => {
    const listing = await Listing.findById(req.params.id)
    if (!listing) return res.status(404).json({ message: 'Listing not found' })
    if (listing.seller.id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only the seller or admin can update offers' })
    }
    const offer = listing.offers.id(req.params.offerId)
    if (!offer) return res.status(404).json({ message: 'Offer not found' })
    offer.status = req.body.status
    await listing.save()
    res.json({ offers: listing.offers })
  })
)

export default router
