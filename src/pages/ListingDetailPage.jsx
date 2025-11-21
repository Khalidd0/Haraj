import { useContext, useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ListingsContext } from '../context/ListingsContext'
import { NotiContext } from '../context/NotiContext'
import { PICKUP_ZONES } from '../data/pickupZones'
import { money } from '../utils/formatters'

export default function ListingDetailPage(){
  const { listings, view, sendOffer } = useContext(ListingsContext)
  const { addNoti } = useContext(NotiContext)
  const { id } = useParams()
  const nav = useNavigate()
  const item = listings.find(l => String(l.id) === String(id))
  const [offer, setOffer] = useState(item? item.price : 0)
  useEffect(()=>{ if(item) view(item.id) }, [id])
  if(!item) return <p>Listing not found.</p>

  function messageSeller(){ nav('/messages/'+item.id) }
  function submitOffer(){ sendOffer(item.id, 'me', Number(offer)); addNoti('Offer submitted') }

  return (
    <div className='grid lg:grid-cols-12 gap-6'>
      <div className='lg:col-span-7'>
        <div className='card overflow-hidden'>
          <div className='aspect-video bg-gray-100'>
            <img src={item.images[0]} className='w-full h-full object-cover'/>
          </div>
        </div>
        <div className='mt-4 card p-4'>
          <h3 className='font-semibold mb-2'>Key Features</h3>
          <ul className='text-sm list-disc pl-5 space-y-1'>
            <li>On-campus pickup at {PICKUP_ZONES.find(z=>z.id===item.zoneId)?.name}</li>
            <li>Condition: {item.condition}</li>
            <li>Verified KFUPM seller</li>
          </ul>
        </div>
      </div>
      <aside className='lg:col-span-5'>
        <div className='card p-4 space-y-3'>
          <div className='text-xl font-semibold'>{item.title}</div>
          <div className='text-2xl font-bold'>{money(item.price)}</div>
          <div>
            <label className='text-xs'>Offer Price (SAR)</label>
            <input type='number' value={offer} onChange={e=>setOffer(Number(e.target.value))} className='input mt-1' />
          </div>
          <div className='flex gap-2'>
            <button onClick={messageSeller} className='btn btn-dark flex-1'>Message Seller</button>
            </div>
          </div>
      </aside>
    </div>
  )
}
