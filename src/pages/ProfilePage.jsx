import { useContext } from 'react'
import { ListingsContext } from '../context/ListingsContext'
import { money } from '../utils/formatters'

export default function ProfilePage(){
  const { listings, setStatus } = useContext(ListingsContext)
  const my = listings.filter(l => l.seller.id === 'me')
  return (
    <div className='grid md:grid-cols-12 gap-6'>
      <aside className='md:col-span-4'>
        <div className='card p-4'>
          <div className='font-medium'>You</div>
          <div className='text-xs text-gray-500'>Verified @kfupm.edu.sa</div>
        </div>
      </aside>
      <section className='md:col-span-8'>
        <h2 className='font-semibold mb-3'>My Listings</h2>
        <div className='grid sm:grid-cols-2 gap-3'>
          {my.length ? my.map(l => (
            <div key={l.id} className='card p-3 space-y-2'>
              <div className='font-medium line-clamp-1'>{l.title}</div>
              <div className='text-sm flex justify-between'><span>{money(l.price)}</span><span className='italic'>{l.status}</span></div>
              <div className='text-xs text-gray-500'>Views: {l.metrics.views} · Saves: {l.metrics.saves} · Chats: {l.metrics.chats}</div>
              <div className='flex gap-2'>
                <button onClick={()=>setStatus(l.id,'reserved')} className='btn btn-outline text-xs'>Mark Reserved</button>
                <button onClick={()=>setStatus(l.id,'sold')} className='btn btn-outline text-xs'>Mark Sold</button>
              </div>
            </div>
          )) : <div className='text-gray-500'>No items yet.</div>}
        </div>
      </section>
    </div>
  )
}
