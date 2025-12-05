import { ListingsContext } from '../context/ListingsContext'
import { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function SavedPage(){
  const { listings, setSaved } = useContext(ListingsContext)
  const nav = useNavigate()
  const saved = listings.filter(l=> l.favorite)
  const [info, setInfo] = useState('')
  function unsave(id){ setSaved(id, false); setInfo('Removed from saved items') }
  return (
    <div className='space-y-3'>
      <h2 className='text-xl font-semibold'>Saved items</h2>
      {info && <div className='text-sm text-gray-600'>{info}</div>}
      {saved.length? saved.map(l => (
        <div key={l.id} className='card p-3 flex items-center justify-between'>
          <div>
            <div className='font-medium'>{l.title}</div>
            <div className='text-xs text-gray-500'>SAR {l.price}</div>
          </div>
          <div className='flex gap-2'>
            <button className='btn btn-outline text-sm' onClick={()=>nav('/listing/'+l.id)}>View</button>
            <button className='btn btn-dark text-sm' onClick={()=>unsave(l.id)}>Unsave</button>
          </div>
        </div>
      )) : <div className='text-gray-500'>No saved items</div>}
    </div>
  )
}
