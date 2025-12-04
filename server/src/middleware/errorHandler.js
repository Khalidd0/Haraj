export function notFound(req, res, next) {
  res.status(404).json({ message: 'Route not found' })
}

export function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  const status = err.statusCode || 500
  const payload = { message: err.message || 'Server error' }
  if (err.details) {
    payload.details = err.details
  }
  console.error('Error handler:', status, err.message)
  res.status(status).json(payload)
}
