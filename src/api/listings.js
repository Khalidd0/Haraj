import { apiFetch } from './client'

export function listListings(params = {}) {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') query.append(k, v)
  })
  const qs = query.toString() ? `?${query.toString()}` : ''
  return apiFetch(`/listings${qs}`)
}

export function getListing(id) {
  return apiFetch(`/listings/${id}`)
}

export function createListing(payload) {
  return apiFetch('/listings', { method: 'POST', body: payload })
}

export function updateListing(id, payload) {
  return apiFetch(`/listings/${id}`, { method: 'PATCH', body: payload })
}

export function deleteListing(id) {
  return apiFetch(`/listings/${id}`, { method: 'DELETE' })
}

export function incrementMetric(id, metric) {
  return apiFetch(`/listings/${id}/metrics`, { method: 'POST', body: { metric } })
}

export function listMessages(id, buyerId) {
  const qs = buyerId ? `?buyerId=${buyerId}` : ''
  return apiFetch(`/listings/${id}/messages${qs}`)
}

export function sendListingMessage(id, text, to) {
  const body = { text }
  if (to) body.to = to
  return apiFetch(`/listings/${id}/messages`, { method: 'POST', body })
}

export function getSaved() {
  return apiFetch('/saved')
}

export function saveListing(id) {
  return apiFetch(`/saved/${id}`, { method: 'POST' })
}

export function unsaveListing(id) {
  return apiFetch(`/saved/${id}`, { method: 'DELETE' })
}

export function createOffer(id, price) {
  return apiFetch(`/listings/${id}/offers`, { method: 'POST', body: { price } })
}

export function updateOffer(id, offerId, status) {
  return apiFetch(`/listings/${id}/offers/${offerId}`, { method: 'PATCH', body: { status } })
}
