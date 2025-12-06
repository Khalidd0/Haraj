import { apiFetch } from './client'

export function listUsers(query) {
  const qs = query ? `?q=${encodeURIComponent(query)}` : ''
  return apiFetch(`/users${qs}`)
}

export function suspendUser(id) {
  return apiFetch(`/users/${id}/suspend`, { method: 'PATCH' })
}

export function reactivateUser(id) {
  return apiFetch(`/users/${id}/reactivate`, { method: 'PATCH' })
}

