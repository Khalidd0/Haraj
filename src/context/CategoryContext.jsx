import { createContext, useEffect, useState } from 'react'
import { listCategories } from '../api/categories'

export const CategoryContext = createContext()

export function CategoryProvider({ children }) {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await listCategories()
      setCategories(res.categories || [])
    } catch (err) {
      setError(err.message || 'Failed to load categories')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const value = { categories, setCategories, reloadCategories: load, loading, error }
  return <CategoryContext.Provider value={value}>{children}</CategoryContext.Provider>
}

