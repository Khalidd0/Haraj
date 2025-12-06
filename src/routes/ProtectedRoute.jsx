import { useContext } from 'react'
import { Navigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

export default function ProtectedRoute({ children }){
  const { user, initializing } = useContext(AuthContext)
  if (initializing) return null
  if (!user) return <Navigate to="/login" replace />
  return children
}
