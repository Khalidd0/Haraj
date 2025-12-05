import { getApiBase, getAuthHeader } from './client'

export async function uploadImage(file) {
  const formData = new FormData()
  formData.append('image', file)
  const res = await fetch(`${getApiBase()}/uploads`, {
    method: 'POST',
    headers: {
      ...getAuthHeader()
    },
    body: formData
  })
  const data = await res.json()
  if (!res.ok) {
    throw new Error(data?.message || `Upload failed with ${res.status}`)
  }
  return data.url
}
