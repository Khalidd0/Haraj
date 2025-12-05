const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api'

let authToken = null

export function setAuthToken(token) {
  authToken = token || null
}

export function getAuthHeader() {
  return authToken ? { Authorization: `Bearer ${authToken}` } : {}
}

export function getApiBase() {
  return API_BASE
}

export async function apiFetch(path, { method = 'GET', body, headers = {} } = {}) {
  const opts = {
    method,
    headers: {
      Accept: 'application/json',
      ...headers
    }
  }
  if (authToken) {
    opts.headers.Authorization = `Bearer ${authToken}`
  }
  if (body !== undefined) {
    opts.headers['Content-Type'] = 'application/json'
    opts.body = JSON.stringify(body)
  }

  const res = await fetch(`${API_BASE}${path}`, opts)
  const text = await res.text()
  const data = text ? JSON.parse(text) : null
  if (!res.ok) {
    const message = data?.message || `Request failed with ${res.status}`
    const err = new Error(message)
    err.status = res.status
    err.details = data?.errors || data?.details
    throw err
  }
  return data
}
