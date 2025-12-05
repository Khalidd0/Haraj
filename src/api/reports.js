import { apiFetch } from './client'

export function createReport(payload) {
  return apiFetch('/reports', { method: 'POST', body: payload })
}

export function listReports() {
  return apiFetch('/reports')
}

export function deleteReport(id) {
  return apiFetch(`/reports/${id}`, { method: 'DELETE' })
}
