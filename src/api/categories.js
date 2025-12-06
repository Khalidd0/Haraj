import { apiFetch } from './client'

export function listCategories() {
  return apiFetch('/categories')
}

export function createCategory(name) {
  return apiFetch('/categories', { method: 'POST', body: { name } })
}

export function updateCategory(id, name) {
  return apiFetch(`/categories/${id}`, { method: 'PUT', body: { name } })
}

export function deleteCategory(id) {
  return apiFetch(`/categories/${id}`, { method: 'DELETE' })
}

