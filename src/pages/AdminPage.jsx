import { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../context/AuthContext'
import { deleteReport, listReports } from '../api/reports'
import { CATEGORIES } from '../data/categories'

export default function AdminPage(){
  const { user } = useContext(AuthContext)
  const [reports, setReports] = useState([])
  const [cats, setCats] = useState(CATEGORIES)
  const [newCat, setNewCat] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if(user?.role === 'admin'){
      listReports().then(res => setReports(res.reports)).catch(err => setError(err.message))
    }
  }, [user])

  function addCat(){ if(!newCat.trim()) return; setCats(arr=> [...arr, {id:Date.now(), name:newCat.trim()}]); setNewCat('') }
  function delCat(id){ setCats(arr=> arr.filter(c=>c.id!==id)) }

  async function dismiss(id){
    try{
      await deleteReport(id)
      setReports(arr=> arr.filter(r=>r._id!==id && r.id!==id))
    }catch(err){ setError(err.message) }
  }

  if(user?.role !== 'admin') return <div className='text-red-600'>Admin access required.</div>

  return (
    <div className='grid lg:grid-cols-12 gap-6'>
      <section className='lg:col-span-7'>
        <h2 className='text-xl font-semibold mb-2'>Reports</h2>
        {error && <div className='text-sm text-red-600 mb-2'>{error}</div>}
        <div className='space-y-2'>
          {reports.length ? reports.map(r=> (
            <div key={r.id || r._id} className='card p-3 flex items-center justify-between'>
              <div>
                <div className='font-medium'>{r.reason}</div>
                <div className='text-xs text-gray-500'>Type: {r.type} • Target #{r.targetId} • by {r.byEmail}</div>
              </div>
              <div className='flex gap-2'>
                <button className='btn btn-outline' onClick={()=>dismiss(r.id || r._id)}>Dismiss</button>
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
