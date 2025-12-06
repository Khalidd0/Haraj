import { Server } from 'socket.io'
import jwt from 'jsonwebtoken'
import User from './models/User.js'

function roomForUser(userId) {
  return `user:${userId}`
}

export function setupSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: '*'
    }
  })

  // Simple JWT auth for sockets
  io.use(async (socket, next) => {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.query?.token ||
      socket.handshake.headers?.authorization?.replace?.('Bearer ', '')
    if (!token) return next(new Error('Unauthorized'))
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      const user = await User.findById(decoded.id)
      if (!user || user.status === 'suspended') {
        return next(new Error('Unauthorized'))
      }
      socket.user = { id: user.id, role: user.role, name: user.name, email: user.email }
      return next()
    } catch (err) {
      return next(new Error('Unauthorized'))
    }
  })

  io.on('connection', (socket) => {
    const userRoom = roomForUser(socket.user.id)
    socket.join(userRoom)

    socket.on('join_listing', ({ listingId }) => {
      if (!listingId) return
      socket.join(`listing:${listingId}`)
    })

    socket.on('leave_listing', ({ listingId }) => {
      if (!listingId) return
      socket.leave(`listing:${listingId}`)
    })
  })

  return io
}

export function emitToUsers(io, userIds, event, payload) {
  if (!io || !Array.isArray(userIds)) return
  const rooms = userIds.filter(Boolean).map(roomForUser)
  if (rooms.length) {
    io.to(rooms).emit(event, payload)
  }
}
