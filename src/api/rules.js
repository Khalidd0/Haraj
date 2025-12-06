import { apiFetch } from './client'

export function listPublicRules() {
  return apiFetch('/rules/public')
}

export function listRules() {
  return apiFetch('/rules')
}

export function createRule(payload) {
  return apiFetch('/rules', { method: 'POST', body: payload })
}

export function updateRule(id, payload) {
  return apiFetch(`/rules/${id}`, { method: 'PUT', body: payload })
}

export function deleteRule(id) {
  return apiFetch(`/rules/${id}`, { method: 'DELETE' })
}

