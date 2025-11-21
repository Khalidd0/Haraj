import { useContext } from 'react'
import { ListingsContext } from '../context/ListingsContext'
import { useNavigate, useParams } from 'react-router-dom'
import { NotiContext } from '../context/NotiContext'
import { money } from '../utils/formatters'

function ThreadItem({ l, onOpen }){
  const last = l.messages[l.messages.length-1]
  return (
    <button onClick={onOpen} className='w-full text-left px-4 py-3 border-b hover:bg-gray-50'>
      <div className='font-medium line-clamp-1'>{l.title}</div>
      <div className='text-xs text-gray-500 line-clamp-1'>{last ? (last.type==='offer' ? `Offer • SAR ${l.offers[l.offers.length-1]?.price}` : last.text) : 'No messages yet'}</div>
    </button>
  )
}

export default function MessagesPage(){
  const { listings, sendMessage, sendOffer, setOfferStatus } = useContext(ListingsContext)
  const nav = useNavigate()
  const params = useParams()
  const roomId = params['*'] // catch-all segment
  const room = listings.find(l=> String(l.id)===String(roomId)) || listings.find(l=> l.messages.length>0) || listings[0]
  const { addNoti } = useContext(NotiContext)

  function onSend(text){
    if(!text.trim()) return
    if(text.length>500) return alert('Max 500 chars')
    sendMessage(room.id, 'me', text)
    addNoti('Message sent')
  }
  function onOffer(price){
    const offer = sendOffer(room.id, 'me', Number(price))
    addNoti('Offer submitted')
    return offer
  }
  function sellerAcceptFirst(){
    const first = room.offers[room.offers.length-1]; if(!first) return
    setOfferStatus(room.id, first.id, 'Accepted'); addNoti('Offer accepted (seller)')
  }
  function sellerCounter(){
    const last = room.offers[room.offers.length-1]
    const counter = Math.max(1, Math.round((last?.price||10)*1.1))
    sendOffer(room.id, 'seller', counter)
    addNoti('Seller sent a counter-offer')
  }
  function markCompleted(){
    const accepted = room.offers.find(o=>o.status==='Accepted')
    if(!accepted) return alert('Accept an offer first')
    setOfferStatus(room.id, accepted.id, 'Completed'); addNoti('Transaction completed')
  }

  return (
    <div className='grid lg:grid-cols-12 gap-6'>
      <aside className='lg:col-span-4 card overflow-hidden'>
        {listings.map(l => <ThreadItem key={l.id} l={l} onOpen={()=> nav('/messages/'+l.id)} />)}
      </aside>
      <section className='lg:col-span-8 card p-0 overflow-hidden'>
        <div className='border-b px-4 py-3 flex items-center justify-between'>
          <div className='font-medium'>{room.title}</div>
          <div className='text-sm text-gray-500'>Price: {money(room.price)}</div>
        </div>
        <ChatRoom room={room} onSend={onSend} onOffer={onOffer} onAccept={sellerAcceptFirst} onCounter={sellerCounter} onComplete={markCompleted}/>
      </section>
    </div>
  )
}

import { useState, useRef, useEffect } from 'react'
function ChatRoom({ room, onSend, onOffer, onAccept, onCounter, onComplete }){
  const [text, setText] = useState('')
  const [offer, setOffer] = useState(room.price)
  const endRef = useRef(null)
  useEffect(()=>{ endRef.current?.scrollIntoView({behavior:'smooth'}) }, [room.messages.length, room.offers.length])

  return (
    <div className='h-[520px] grid grid-rows-[1fr_auto] bg-gray-50'>
      <div className='overflow-y-auto p-4 space-y-2'>
        {room.messages.map(m => (
          <div key={m.id} className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm shadow ${m.from==='me' ? 'ml-auto bg-gray-900 text-white' : (m.from==='system' ? 'mx-auto bg-gray-200' : 'bg-white border')}`}>{m.text}</div>
        ))}
        <div className='text-xs text-gray-500 mt-2'>Offers:</div>
        {room.offers.map(o => (
          <div key={o.id} className='text-xs text-gray-600'>• {o.by} offered {money(o.price)} — <i>{o.status}</i></div>
        ))}
        <div ref={endRef}/>
      </div>
      <div className='border-t bg-white p-3 space-y-2'>
        <div className='flex gap-2'>
          <input value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=> e.key==='Enter' && onSend(text) && setText('')} className='input flex-1' placeholder='Type a message (≤500 chars)'/>
          <button className='btn btn-dark' onClick={()=>{onSend(text); setText('')}}>Send</button>
        </div>
        <div className='flex gap-2 items-center'>
          <label className='text-sm'>Offer (SAR)</label>
          <input type='number' value={offer} onChange={e=>setOffer(e.target.value)} className='input w-32'/>
          <button className='btn btn-outline' onClick={()=> onOffer(offer)}>Send Offer</button>
          <button className='btn btn-outline' onClick={onCounter}>Seller Counter</button>
          <button className='btn btn-primary' onClick={onAccept}>Seller Accept</button>
          <button className='btn btn-dark' onClick={onComplete}>Mark Completed</button>
        </div>
      </div>
    </div>
  )
}
