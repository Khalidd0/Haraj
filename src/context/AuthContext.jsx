import { createContext, useEffect, useState } from 'react'
import { fetchMe, loginUser, registerUser, verifyUser } from '../api/auth'
import { setAuthToken } from '../api/client'

const LS_TOKEN = 'hp_token'
export const AuthContext = createContext()

export function AuthProvider({ children }){
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(()=> localStorage.getItem(LS_TOKEN) || '')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (token) {
      setAuthToken(token)
      fetchMe().then(res => setUser(res.user)).catch(() => {
        setUser(null)
        setToken('')
        localStorage.removeItem(LS_TOKEN)
        setAuthToken(null)
      })
    }
  }, [token])

  const login = async ({ email, password }) => {
    const res = await loginUser({ email, password })
    setUser(res.user)
    setToken(res.token)
    localStorage.setItem(LS_TOKEN, res.token)
    setAuthToken(res.token)
    return res.user
  }

  const register = async ({ name, email, password }) => {
    setLoading(true)
    try{
      await registerUser({ name, email, password })
    } finally{
      setLoading(false)
    }
  }

  const verify = async (email) => {
    const res = await verifyUser(email)
    setUser(res.user)
    setToken(res.token)
    localStorage.setItem(LS_TOKEN, res.token)
    setAuthToken(res.token)
    return res.user
  }

  const logout = ()=> {
    setUser(null)
    setToken('')
    localStorage.removeItem(LS_TOKEN)
    setAuthToken(null)
  }

  const value = { user, token, loading, login, logout, register, verify }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
