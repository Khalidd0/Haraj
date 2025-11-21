import { useContext } from 'react'
import { NotiContext } from '../context/NotiContext'
export default function NotificationsPage(){
  const { notis, markAllRead } = useContext(NotiContext)
  return (
    <div className='card p-4'>
      <div className='flex items-center justify-between'>
        <div className='text-lg font-semibold'>Notifications</div>
        <button onClick={markAllRead} className='text-sm underline'>Mark all read</button>
      </div>
      <div className='mt-3 space-y-2'>
        {notis.length? notis.map(n=> (<div key={n.id} className={`border rounded px-3 py-2 ${n.read? 'opacity-60':''}`}>{n.text}</div>)) : <div className='text-gray-500'>No notifications</div>}
      </div>
    </div>
  )
}
