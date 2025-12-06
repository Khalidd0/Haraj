import { useContext, useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ListingsContext } from '../context/ListingsContext'
import { AuthContext } from '../context/AuthContext'
import { PICKUP_ZONES } from '../data/pickupZones'
import { money } from '../utils/formatters'
import { createReport } from '../api/reports'

export default function ListingDetailPage(){
  const { listings, view, sendOffer } = useContext(ListingsContext)
  const { user } = useContext(AuthContext)
  const { id } = useParams()
  const nav = useNavigate()
  const item = listings.find(l => String(l.id) === String(id))
  const [activeIdx, setActiveIdx] = useState(0)
  const [offer, setOffer] = useState(item? item.price : 0)
  const [showReport, setShowReport] = useState(false)
  const [reportReason, setReportReason] = useState('')
  const [reportMsg, setReportMsg] = useState('')
  const [reportError, setReportError] = useState('')
  useEffect(()=>{ if(item) view(item.id) }, [id])
  useEffect(()=>{ setActiveIdx(0); if(item) setOffer(item.price) }, [item?.id])
  if(!item) return <p>Listing not found.</p>
  const isOwner = user && item.seller?.id === user.id
  const isAdmin = user?.role === 'admin'

  function messageSeller(){ nav('/messages/'+item.id) }
  async function submitOffer(){
    try{
      if(!user) throw new Error('Login to send offers')
      if(isOwner) throw new Error('You cannot send offers to your own listing')
      if(isAdmin) throw new Error('Admin accounts cannot send offers')
      await sendOffer(item.id, user.id, Number(offer))
    }catch(err){ alert(err.message) }
  }

  async function submitReport(e){
    e.preventDefault()
    if (!user) {
      setReportError('Login required to report')
      return
    }
    if (!reportReason.trim()) {
      setReportError('Please describe the issue')
      return
    }
    try{
      setReportError('')
      setReportMsg('')
      await createReport({ type: 'listing', targetId: String(item.id), reason: reportReason.trim() })
      setReportMsg('Report submitted to admins. Thank you.')
      setReportReason('')
      setShowReport(false)
    }catch(err){
      setReportError(err.message || 'Failed to submit report')
    }
  }

  return (
    <div className='grid lg:grid-cols-12 gap-6'>
      <div className='lg:col-span-7'>
        <div className='card overflow-hidden'>
          <div className='aspect-video bg-gray-100 flex items-center justify-center'>
            <img src={item.images[activeIdx] || item.images[0]} className='max-h-full max-w-full object-contain'/>
          </div>
        </div>
        {item.images?.length > 1 && (
          <div className='mt-3 flex gap-2 overflow-x-auto pb-1'>
            {item.images.map((src, idx)=>(
              <button
                key={idx}
                onClick={()=> setActiveIdx(idx)}
                className={`border rounded-md overflow-hidden w-20 h-20 flex items-center justify-center ${activeIdx===idx? 'ring-2 ring-[var(--brand)]' : 'border-gray-200'}`}
              >
                <img src={src} className='object-cover w-full h-full'/>
              </button>
            ))}
          </div>
        )}
        <div className='mt-4 card p-4'>
          <h3 className='font-semibold mb-2'>Description</h3>
          <p className='text-sm text-gray-700 whitespace-pre-line'>
            {item.description || 'No description provided.'}
          </p>
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
          {isOwner && (
            <div className='flex items-center justify-between text-xs text-gray-600'>
              <span>You posted this listing.</span>
              <button
                type='button'
                onClick={()=> nav('/listing/'+item.id+'/edit')}
                className='underline text-[var(--brand)]'
              >
                Edit listing
              </button>
            </div>
          )}
          <div>
            <label className='text-xs'>Offer Price (SAR)</label>
            <input type='number' value={offer} onChange={e=>setOffer(Number(e.target.value))} className='input mt-1' />
          </div>
          {!isAdmin && (
            <div className='flex gap-2'>
              <button onClick={messageSeller} className='btn btn-dark flex-1' disabled={isOwner}>Message Seller</button>
              <button onClick={submitOffer} className='btn btn-outline' disabled={isOwner}>Send Offer</button>
            </div>
          )}
          {!isOwner && !isAdmin && (
            <div className='mt-3 space-y-2 text-xs'>
              <button
                type='button'
                className='underline text-red-600'
                onClick={() => { setShowReport(v => !v); setReportError(''); setReportMsg('') }}
              >
                Report this listing
              </button>
              {showReport && (
                <form onSubmit={submitReport} className='space-y-2'>
                  <textarea
                    className='input text-xs'
                    rows={3}
                    placeholder='Describe what is wrong with this listing (fake item, spam, etc.)'
                    value={reportReason}
                    onChange={e => setReportReason(e.target.value)}
                  />
                  {reportError && <div className='text-red-600'>{reportError}</div>}
                  {reportMsg && <div className='text-green-700'>{reportMsg}</div>}
                  <button className='btn btn-outline btn-sm'>Send report</button>
                </form>
              )}
            </div>
          )}
        </div>
      </aside>
    </div>
  )
}
