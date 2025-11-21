import { useContext, useState } from 'react'
import { UsersContext } from '../context/UsersContext'
import { CATEGORIES } from '../data/categories'

export default function AdminPage(){
  const { reports, removeReport } = useContext(UsersContext)
  const [cats, setCats] = useState(CATEGORIES)
  const [newCat, setNewCat] = useState('')

  function addCat(){ if(!newCat.trim()) return; setCats(arr=> [...arr, {id:Date.now(), name:newCat.trim()}]); setNewCat('') }
  function delCat(id){ setCats(arr=> arr.filter(c=>c.id!==id)) }

  return (
    <div className='grid lg:grid-cols-12 gap-6'>
      <section className='lg:col-span-7'>
        <h2 className='text-xl font-semibold mb-2'>Reports</h2>
        <div className='space-y-2'>
          {reports.length ? reports.map(r=> (
            <div key={r.id} className='card p-3 flex items-center justify-between'>
              <div>
                <div className='font-medium'>{r.reason}</div>
                <div className='text-xs text-gray-500'>Type: {r.type} · Target #{r.targetId} · by {r.byEmail}</div>
              </div>
              <div className='flex gap-2'>
                <button className='btn btn-outline' onClick={()=>removeReport(r.id)}>Dismiss</button>
                <button className='btn btn-dark' onClick={()=>removeReport(r.id)}>Remove Listing</button>
              </div>
            </div>
          )) : <div className='text-gray-500'>No reports</div>}
        </div>
      </section>
      <aside className='lg:col-span-5'>
        <h2 className='text-xl font-semibold mb-2'>Categories</h2>
        <div className='card p-3 space-y-2'>
          <div className='flex gap-2'>
            <input className='input' placeholder='Add category' value={newCat} onChange={e=>setNewCat(e.target.value)} />
            <button className='btn btn-primary' onClick={addCat}>Add</button>
          </div>
          <div className='space-y-1'>
            {cats.map(c=> (
              <div key={c.id} className='flex items-center justify-between border rounded px-2 py-1'>
                <div>{c.name}</div>
                <button className='text-sm underline' onClick={()=>delCat(c.id)}>Delete</button>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  )
}
