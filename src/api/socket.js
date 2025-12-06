import { io } from 'socket.io-client'
import { getApiBase } from './client'

let socket = null

export function connectSocket(token) {
  const base = getApiBase().replace(/\/api\/?$/, '')
  if (!token) return null
  if (socket) {
    socket.disconnect()
    socket = null
  }
  socket = io(base, {
    auth: { token },
    autoConnect: true
  })
  return socket
}

export function getSocket() {
  return socket
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}
