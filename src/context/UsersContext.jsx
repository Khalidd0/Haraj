import { createContext, useEffect, useState } from 'react'

const LS_USERS = 'hp_users'
const LS_REPORTS = 'hp_reports'
export const UsersContext = createContext()

function read(key, fallback){
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback } catch { return fallback }
}
function write(key, value){ localStorage.setItem(key, JSON.stringify(value)) }

export function UsersProvider({ children }){
  const [users, setUsers] = useState(()=> read(LS_USERS, [])) // {name,email,password,verified}
  const [reports, setReports] = useState(()=> read(LS_REPORTS, [])) // {id, type, targetId, reason, byEmail, at}
  useEffect(()=> write(LS_USERS, users), [users])
  useEffect(()=> write(LS_REPORTS, reports), [reports])

  function signup({name, email, password}){
    if(users.some(u=> u.email.toLowerCase()===email.toLowerCase())){
      throw new Error('Email already exists')
    }
    setUsers(arr => [...arr, { name, email, password, verified:false }])
  }
  function markVerified(email){
    setUsers(arr => arr.map(u => u.email===email ? {...u, verified:true} : u))
  }
  function addReport(r){
    const report = { id: Date.now(), ...r, at: new Date().toISOString() }
    setReports(arr => [report, ...arr])
    return report
  }
  function removeReport(id){ setReports(arr => arr.filter(r=>r.id!==id)) }

  return (
    <UsersContext.Provider value={{ users, signup, markVerified, reports, addReport, removeReport }}>
      {children}
    </UsersContext.Provider>
  )
}
