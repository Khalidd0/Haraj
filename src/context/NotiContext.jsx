import { createContext, useState } from 'react'
export const NotiContext = createContext()
export function NotiProvider({ children }){
  const [notis, setNotis] = useState([])
  const addNoti = (text)=> setNotis(n=> [...n, { id: Date.now(), text, read:false }])
  const markAllRead = ()=> setNotis(n=> n.map(x=> ({...x, read:true})))
  return <NotiContext.Provider value={{ notis, addNoti, markAllRead }}>{children}</NotiContext.Provider>
}
