import { createContext, useState } from 'react'

export const AuthContext = createContext()

export function AuthProvider({ children }){
  const [user, setUser] = useState(null) // {email,name}

  const login = ({ email, password })=>{
    const raw = localStorage.getItem('hp_users')
    const arr = raw ? JSON.parse(raw) : []
    const found = arr.find(u => u.email.toLowerCase()===email.toLowerCase())
    if(!found) throw new Error('Account not found')
    if(!found.verified) throw new Error('Please verify your email first')
    if(found.password !== password) throw new Error('Incorrect password')
    setUser({ email: found.email, name: found.name })
  }
  const logout = ()=> setUser(null)

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>
}
