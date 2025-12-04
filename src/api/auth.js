import { apiFetch, setAuthToken } from './client'

export async function registerUser(payload) {
  return apiFetch('/auth/register', { method: 'POST', body: payload })
}

export async function verifyUser(email) {
  const res = await apiFetch('/auth/verify', { method: 'POST', body: { email } })
  setAuthToken(res.token)
  return res
}

export async function loginUser(payload) {
  const res = await apiFetch('/auth/login', { method: 'POST', body: payload })
  setAuthToken(res.token)
  return res
}

export async function fetchMe() {
  return apiFetch('/auth/me')
}
