import { useContext, useEffect, useState, useRef } from 'react'
import { ListingsContext } from '../context/ListingsContext'
import { useNavigate, useParams } from 'react-router-dom'
import { money } from '../utils/formatters'
import { AuthContext } from '../context/AuthContext'

const filterMessagesForThread = (listing, msgs, meId, buyerId)=>{
  const sellerId = listing.seller?.id
  const isSeller = meId && String(sellerId) === String(meId)
  if (isSeller) {
    return msgs.filter(m => {
      const fromSeller = String(m.from) === String(meId)
      const fromBuyer = buyerId && String(m.from) === String(buyerId)
      const toBuyer = buyerId && String(m.to) === String(buyerId)
      return m.from === 'system' || fromBuyer || (fromSeller && (!m.to || toBuyer))
    })
  }
  return msgs.filter(m => {
    const fromBuyer = String(m.from) === String(meId)
    const fromSeller = String(m.from) === String(sellerId)
    const directedToUser = !m.to || String(m.to) === String(meId)
    return m.from === 'system' || fromBuyer || (fromSeller && directedToUser)
  })
}

function buildThreads(listings, messagesByListing, userId, includeListingId){
  return listings.flatMap(l => {
    const isSeller = userId && String(l.seller?.id) === String(userId)
    const listingMessages = messagesByListing[l.id] || []
    if (!isSeller) {
      const filtered = filterMessagesForThread(l, listingMessages, userId, userId)
      const shouldInclude = filtered.length > 0 || (includeListingId && String(includeListingId) === String(l.id))
      return shouldInclude ? [{ ...l, threadId: String(l.id), listingId: l.id, participant: userId, messages: filtered }] : []
    }
    const buyers = [...new Set(listingMessages.filter(m => String(m.from) !== String(userId) && m.from !== 'system').map(m => String(m.from)))]
    if (buyers.length === 0) return [{ ...l, threadId: `${l.id}:none`, listingId: l.id, participant: null, empty: true, messages: [] }]
    return buyers.map(buyerId => ({
      ...l,
      threadId: `${l.id}:${buyerId}`,
      listingId: l.id,
      participant: buyerId,
      messages: filterMessagesForThread(l, listingMessages, userId, buyerId)
    }))
  })
}

function ThreadItem({ l, onOpen, unread, meId }){
  const visible = l.messages || []
  const last = visible[visible.length-1]
  const lastText = last ? last.text : 'No messages yet'

  // Determine the other party's name for this thread
  let otherName = ''
  const sellerId = l.seller?.id
  const sellerName = l.seller?.name || 'Seller'
  const isSellerMe = meId && String(sellerId) === String(meId)

  if (isSellerMe) {
    const otherMsg = [...visible].reverse().find(m => m.from !== 'system' && String(m.from) !== String(meId))
    otherName = otherMsg?.fromName || 'Buyer'
  } else {
    otherName = sellerName
  }

  return (
    <button onClick={onOpen} className='w-full text-left px-4 py-3 border-b hover:bg-gray-50 flex items-start justify-between gap-2'>
      <div>
        <div className='font-medium line-clamp-1'>{l.title}</div>
        <div className='text-xs text-gray-600 line-clamp-1'>{otherName}</div>
        <div className='text-xs text-gray-500 line-clamp-1'>{lastText}</div>
      </div>
      {unread ? <span className='inline-block w-2 h-2 rounded-full bg-red-500 mt-1' aria-label='New message'/> : null}
    </button>
  )
}

export default function MessagesPage(){
  const { listings, sendMessage, messagesByListing, loadMessagesForListing } = useContext(ListingsContext)
  const { user } = useContext(AuthContext)
  const nav = useNavigate()
  const params = useParams()
  const roomId = params['*'] // catch-all segment
  const [lastSeen, setLastSeen] = useState({})

  const [listingPart, buyerPart] = (roomId || '').split(':')
  const threads = buildThreads(listings, messagesByListing, user?.id, listingPart)
  const explicitRoom = threads.find(t => t.threadId === roomId) ||
    threads.find(t => String(t.listingId) === String(listingPart) && (!buyerPart || String(t.participant) === String(buyerPart)))
  const room = explicitRoom || threads[0]

  useEffect(()=> {
    if(room?.listingId || room?.id){
      loadMessagesForListing(room.listingId || room.id)
    }
  }, [room?.listingId, room?.id])

  // Poll all visible threads so new messages appear automatically
  useEffect(() => {
    if (!user?.id) return
    const listingIds = Array.from(
      new Set(
        threads.map(t => t.listingId || t.id).filter(Boolean)
      )
    )
    if (!listingIds.length) return
    const interval = setInterval(() => {
      listingIds.forEach(id => loadMessagesForListing(id))
    }, 1500)
    return () => clearInterval(interval)
  }, [user?.id, threads, loadMessagesForListing])

  useEffect(()=>{
    if(room?.threadId){
      setLastSeen(map => ({ ...map, [room.threadId]: Date.now() }))
    }
  }, [room?.threadId])

  if(!room) return <div>No conversations yet. Start by messaging a seller from a listing.</div>

  const visibleMessages = room.messages || []
  const roomHasOtherParty = visibleMessages.some(m=> String(m.from)!==String(user?.id))
  const isSeller = user && room.seller?.id === user.id

  function onSend(text){
    if(!text.trim()) return
    if(text.length>500) return alert('Max 500 chars')
    if(isSeller && (!roomHasOtherParty && !room.participant)) return alert('Wait for a buyer to contact you')
    const recipient = isSeller ? room.participant : room.seller?.id
    if(isSeller && !recipient) return alert('Select a buyer thread to reply')
    sendMessage(room.listingId || room.id, user?.id, text, recipient).catch(err=> alert(err.message))
  }

  function hasUnread(l){
    const seen = lastSeen[l.threadId] || 0
    const visible = l.messages || []
    return visible.some(m => String(m.from)!==String(user?.id) && new Date(m.at || Date.now()).getTime() > seen)
  }

  const threadList = threads.map(l => ({ ...l, meId: user?.id })) // inject current user id for ThreadItem

  return (
    <div className='grid lg:grid-cols-12 gap-6'>
      <aside className='lg:col-span-4 card overflow-hidden'>
        {threadList.map(l => <ThreadItem key={l.threadId} l={l} onOpen={()=> nav('/messages/'+l.threadId)} unread={hasUnread(l)} meId={user?.id} />)}
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
  const visibleMessages = room.messages || []
  useEffect(()=>{ endRef.current?.scrollIntoView({behavior:'smooth'}) }, [visibleMessages.length])

  const canSendMessage = (!isSeller || roomHasOtherParty) && (!isSeller || !!room?.participant)

  const nameFor = (from)=>{
    if(!from) return 'Unknown'
    if(String(from)===String(meId)) return meName || 'You'
    if(String(from)===String(sellerId)) return sellerName || 'Seller'
    const found = room.messages.find(m=> String(m.from)===String(from))
    return found?.fromName || 'Buyer'
  }

  const handleSend = () => {
    if (!canSendMessage) return
    const trimmed = text.trim()
    if (!trimmed) return
    onSend(trimmed)
    setText('')
  }

  return (
    <div className='h-[520px] grid grid-rows-[1fr_auto] bg-gray-50'>
      <div className='overflow-y-auto p-4 space-y-2'>
        {visibleMessages.map(m => {
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
          <input
            value={text}
            onChange={e=>setText(e.target.value)}
            onKeyDown={e=> {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleSend()
              }
            }}
            className='input flex-1'
            placeholder={canSendMessage ? 'Type a message (=500 chars)' : 'Waiting for buyer to contact you'}
            disabled={!canSendMessage}
          />
          <button className='btn btn-dark' onClick={handleSend} disabled={!canSendMessage}>Send</button>
        </div>
      </div>
    </div>
  )
}
