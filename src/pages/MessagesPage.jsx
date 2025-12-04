import { useContext, useEffect, useState, useRef } from 'react'
import { ListingsContext } from '../context/ListingsContext'
import { useNavigate, useParams } from 'react-router-dom'
import { NotiContext } from '../context/NotiContext'
import { money } from '../utils/formatters'
import { AuthContext } from '../context/AuthContext'

function ThreadItem({ l, onOpen, unread }){
  const last = l.messages[l.messages.length-1]
  const lastText = last ? (last.type==='offer' ? `Offer • SAR ${l.offers[l.offers.length-1]?.price}` : last.text) : 'No messages yet'
  return (
    <button onClick={onOpen} className='w-full text-left px-4 py-3 border-b hover:bg-gray-50 flex items-start justify-between gap-2'>
      <div>
        <div className='font-medium line-clamp-1'>{l.title}</div>
        <div className='text-xs text-gray-500 line-clamp-1'>{lastText}</div>
      </div>
      {unread ? <span className='inline-block w-2 h-2 rounded-full bg-red-500 mt-1' aria-label='New message'/> : null}
    </button>
  )
}

export default function MessagesPage(){
  const { listings, sendMessage } = useContext(ListingsContext)
  const { user } = useContext(AuthContext)
  const nav = useNavigate()
  const params = useParams()
  const roomId = params['*'] // catch-all segment
  const [lastSeen, setLastSeen] = useState({})

  const myThreads = listings.filter(l =>
    l.seller?.id === user?.id ||
    l.messages?.some(m=> String(m.from) === user?.id)
  )
  const explicitRoom = listings.find(l=> String(l.id)===String(roomId))
  const room = explicitRoom || myThreads.find(l=> String(l.id)===String(roomId)) || myThreads[0] || listings[0]
  const { addNoti } = useContext(NotiContext)

  useEffect(()=>{
    if(room?.id){
      setLastSeen(map => ({ ...map, [room.id]: Date.now() }))
    }
  }, [room?.id])

  if(!room) return <div>No conversations yet.</div>

  const roomHasOtherParty = room.messages.some(m=> String(m.from)!==String(user?.id))
  const isSeller = user && room.seller?.id === user.id

  function onSend(text){
    if(!text.trim()) return
    if(text.length>500) return alert('Max 500 chars')
    if(isSeller && !roomHasOtherParty) return alert('Wait for a buyer to contact you')
    sendMessage(room.id, user?.id, text).then(()=> addNoti('Message sent')).catch(err=> alert(err.message))
  }

  function hasUnread(l){
    const seen = lastSeen[l.id] || 0
    return l.messages.some(m => String(m.from)!==String(user?.id) && new Date(m.at || Date.now()).getTime() > seen)
  }

  const threadList = explicitRoom && !myThreads.some(t=>t.id===explicitRoom.id) ? [explicitRoom, ...myThreads] : (myThreads.length ? myThreads : listings)

  return (
    <div className='grid lg:grid-cols-12 gap-6'>
      <aside className='lg:col-span-4 card overflow-hidden'>
        {threadList.map(l => <ThreadItem key={l.id} l={l} onOpen={()=> nav('/messages/'+l.id)} unread={hasUnread(l)} />)}
      </aside>
      <section className='lg:col-span-8 card p-0 overflow-hidden'>
        <div className='border-b px-4 py-3 flex items-center justify-between'>
          <div className='font-medium'>{room.title}</div>
          <div className='text-sm text-gray-500'>Price: {money(room.price)}</div>
        </div>
        <ChatRoom room={room} onSend={onSend} meId={user?.id} meName={user?.name} sellerId={room?.seller?.id} sellerName={room?.seller?.name} isSeller={isSeller} roomHasOtherParty={roomHasOtherParty}/>
      </section>
    </div>
  )
}

function ChatRoom({ room, onSend, meId, meName, sellerId, sellerName, isSeller, roomHasOtherParty }){
  const [text, setText] = useState('')
  const endRef = useRef(null)
  useEffect(()=>{ endRef.current?.scrollIntoView({behavior:'smooth'}) }, [room.messages.length])

  const canSendMessage = !isSeller || roomHasOtherParty

  const nameFor = (from)=>{
    if(!from) return 'Unknown'
    if(String(from)===String(meId)) return meName || 'You'
    if(String(from)===String(sellerId)) return sellerName || 'Seller'
    return room.messages.find(m=> String(m.from)===String(from))?.fromName || 'Buyer'
  }

  return (
    <div className='h-[520px] grid grid-rows-[1fr_auto] bg-gray-50'>
      <div className='overflow-y-auto p-4 space-y-2'>
        {room.messages.map(m => {
          const mine = meId && String(m.from)===String(meId)
          const fromLabel = m.fromName || nameFor(m.from)
          return (
            <div key={m.id} className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm shadow ${mine ? 'ml-auto bg-gray-900 text-white' : (m.from==='system' ? 'mx-auto bg-gray-200' : 'bg-white border')}`}>
              <div className='text-[10px] text-gray-500 mb-0.5'>{fromLabel}</div>
              {m.text}
            </div>
          )
        })}
        <div ref={endRef}/>
      </div>
      <div className='border-t bg-white p-3 space-y-2'>
        <div className='flex gap-2'>
          <input value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=> e.key==='Enter' && canSendMessage && onSend(text) && setText('')} className='input flex-1' placeholder={canSendMessage ? 'Type a message (=500 chars)' : 'Waiting for buyer to contact you'} disabled={!canSendMessage}/>
          <button className='btn btn-dark' onClick={()=>{canSendMessage && onSend(text); setText('')}} disabled={!canSendMessage}>Send</button>
        </div>
      </div>
    </div>
  )
}
