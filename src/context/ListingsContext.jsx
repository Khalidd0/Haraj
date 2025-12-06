import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { listListings, createListing as apiCreate, incrementMetric, sendListingMessage, createOffer, updateOffer, updateListing, deleteListing, listMessages, getSaved, saveListing, unsaveListing } from '../api/listings'
import { getApiBase } from '../api/client'
import { connectSocket } from '../api/socket'
import { AuthContext } from './AuthContext'

export const ListingsContext = createContext()

function normalizeListing(l) {
  const offers = Array.isArray(l.offers) ? l.offers.map(o => ({ ...o, id: o._id || o.id, by: o.by?.toString?.() || o.by, byName: o.byName })) : []
  const id = l._id || l.id
  const sellerId = l.seller?.id || l.seller?._id
  return {
    id,
    favorite: false,
    metrics: { views: 0, saves: 0, chats: 0, ...(l.metrics || {}) },
    offers,
    ...l,
    messages: [],
    images: Array.isArray(l.images) ? l.images.map(addBase) : [],
    seller: l.seller ? { ...l.seller, id: sellerId } : l.seller
  }
}

function normalizeMessage(m){
  if (!m) return null
  const fromId = m.from?.toString?.() || m.from
  // allow system messages without from id
  if (!fromId && m.from !== 'system') return null
  const toId = m.to?.toString?.() || m.to
  return {
    ...m,
    id: m._id || m.id,
    from: fromId || m.from, // preserve 'system'
    to: toId,
    at: m.at || m.createdAt || new Date().toISOString()
  }
}

function addBase(url){
  if (!url) return url
  if (url.startsWith('http')) return url
  const base = getApiBase().replace(/\/api\/?$/, '')
  return `${base}${url.startsWith('/') ? url : `/${url}`}`
}

export function ListingsProvider({ children }){
  const { token, user } = useContext(AuthContext)
  const [listings, setListings] = useState([])
  const [messagesByListing, setMessagesByListing] = useState({})
  const [savedSet, setSavedSet] = useState(new Set())
  const socketRef = useRef(null)

  useEffect(() => { loadListings() }, [])
  useEffect(() => { if(user) loadSaved(); else setSavedSet(new Set()) }, [user?.id])

  useEffect(() => {
    if (!token) {
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
      }
      return
    }
    const socket = connectSocket(token)
    socketRef.current = socket
    const handleMessage = (payload) => {
      const listingId = payload.listingId || payload.listing?.id || payload.listingId
      if (!listingId) return
      const msg = normalizeMessage(payload)
      if (!msg) return
      setMessagesByListing(map => {
        const arr = (map[listingId] || []).filter(Boolean)
        if (arr.some(m => String(m.id) === String(msg.id))) return map
        return { ...map, [listingId]: [...arr, msg] }
      })
      setListings(arr => arr.map(l => String(l.id) === String(listingId) ? { ...l, metrics: { ...l.metrics, chats: (l.metrics?.chats || 0) + 1 } } : l))
    }
    const handleOfferNew = (payload) => {
      const listingId = payload.listingId
      if (!listingId || !payload.offer) return
      setListings(arr => arr.map(l => {
        if (String(l.id) !== String(listingId)) return l
        const existing = Array.isArray(l.offers) ? l.offers : []
        const idx = existing.findIndex(o => String(o.id || o._id) === String(payload.offer.id || payload.offer._id))
        const updatedOffers = idx >= 0 ? existing.map((o, i) => i === idx ? payload.offer : o) : [...existing, payload.offer]
        return { ...l, offers: updatedOffers, metrics: { ...l.metrics, chats: (l.metrics?.chats || 0) + 1 } }
      }))
    }
    const handleOfferUpdated = (payload) => {
      const listingId = payload.listingId
      if (!listingId || !payload.offer) return
      setListings(arr => arr.map(l => {
        if (String(l.id) !== String(listingId)) return l
        const existing = Array.isArray(l.offers) ? l.offers : []
        const updatedOffers = existing.map(o => String(o.id || o._id) === String(payload.offer.id || payload.offer._id) ? payload.offer : o)
        return { ...l, offers: updatedOffers }
      }))
    }
    socket.on('message:new', handleMessage)
    socket.on('offer:new', handleOfferNew)
    socket.on('offer:updated', handleOfferUpdated)
    socket.on('connect_error', (err) => {
      console.warn('socket error', err.message)
    })
    return () => {
      socket.off('message:new', handleMessage)
      socket.off('offer:new', handleOfferNew)
      socket.off('offer:updated', handleOfferUpdated)
      socket.disconnect()
      socketRef.current = null
    }
  }, [token])

  async function loadListings() {
    try{
      const res = await listListings()
      setListings(res.listings.map(normalizeListing).map(l => ({ ...l, favorite: savedSet.has(String(l.id)) })))
    }catch(err){
      console.error('Failed to load listings', err.message)
    }
  }

  async function loadSaved(){
    try{
      const res = await getSaved()
      const ids = new Set((res.saved || []).map(s => String(s.listingId)))
      setSavedSet(ids)
      setListings(arr => arr.map(l => ({ ...l, favorite: ids.has(String(l.id)) })))
    }catch(err){
      console.error('Failed to load saved', err.message)
    }
  }

  const view = async (id)=>{
    setListings(arr=> arr.map(l=> l.id===id? {...l, metrics:{...l.metrics, views:l.metrics.views+1}}:l))
    try{ await incrementMetric(id, 'views') }catch(err){ console.warn('metric view failed', err.message) }
  }

  const addChat = async (id)=>{
    setListings(arr=> arr.map(l=> l.id===id? {...l, metrics:{...l.metrics, chats:l.metrics.chats+1}}:l))
    try{ await incrementMetric(id, 'chats') }catch(err){ console.warn('metric chat failed', err.message) }
  }

  async function setSaved(id, nextFavorite){
    if (!user) throw new Error('Login required')
    setListings(arr=> arr.map(l=> l.id===id? {...l, favorite: nextFavorite, metrics:{...l.metrics, saves: nextFavorite ? l.metrics.saves+1 : Math.max(0, l.metrics.saves-1)}}:l))
    setSavedSet(prev => {
      const copy = new Set(prev)
      if (nextFavorite) copy.add(String(id)); else copy.delete(String(id))
      return copy
    })
    try{
      if(nextFavorite) await saveListing(id)
      else await unsaveListing(id)
    }catch(err){
      console.warn('save toggle failed', err.message)
    }
  }

  const createListing = async (payload)=>{
    const res = await apiCreate(payload)
    setListings(arr=> [normalizeListing(res.listing), ...arr])
    return res.listing
  }

  const editListing = async (id, payload)=>{
    const res = await updateListing(id, payload)
    const updated = normalizeListing(res.listing)
    const withFavorite = { ...updated, favorite: savedSet.has(String(updated.id)) }
    setListings(arr=> arr.map(l=> l.id===id? withFavorite : l))
    return res.listing
  }

  function ensureThread(id){
    setListings(arr=> arr.map(l=> l.id===id? l : l))
    return true
  }

  async function loadMessagesForListing(listingId){
    if (!listingId) return []
    try{
      const res = await listMessages(listingId)
      const msgs = Array.isArray(res.messages) ? res.messages.map(normalizeMessage).filter(Boolean) : []
      setMessagesByListing(map => ({ ...map, [listingId]: msgs }))
      return msgs
    }catch(err){
      console.error('Failed to load messages', err.message)
      return []
    }
  }

  function getMessages(listingId){
    return (messagesByListing[listingId] || []).filter(Boolean)
  }

  async function sendMessage(id, from, text, to){
    if (!user) throw new Error('Login required')
    const sender = from || user.id
    const optimisticId = `temp-${Date.now()}`
    const optimistic = { id: optimisticId, from: sender, to, fromName: user.name, text, type: 'message', at: new Date().toISOString(), temp: true }
    setMessagesByListing(map => ({ ...map, [id]: [...(map[id] || []).filter(Boolean), optimistic] }))
    try{
      const res = await sendListingMessage(id, text, to)
      const saved = normalizeMessage(res.message)
      if (!saved) throw new Error('Message missing sender')
      setMessagesByListing(map => {
        const arr = (map[id] || []).filter(Boolean)
        const filtered = arr.filter(m => m.id !== optimisticId)
        if (filtered.some(m => String(m.id) === String(saved.id))) {
          return { ...map, [id]: filtered }
        }
        return { ...map, [id]: [...filtered, saved] }
      })
    }catch(err){
      setMessagesByListing(map => {
        const arr = map[id] || []
        return { ...map, [id]: arr.filter(m => m.id !== optimisticId) }
      })
      throw err
    }
  }

  async function sendOffer(id, from, price){
    if (!user) throw new Error('Login required')
    const by = from || user.id
    const offer = { id: Date.now(), by, byName:user.name, price, status:'Pending', at:new Date().toISOString() }
    setListings(arr=> arr.map(l=> l.id===id? {...l, offers:[...l.offers, offer]}:l))
    try{
      const res = await createOffer(id, price)
      setListings(arr=> arr.map(l=> l.id===id? {...l, offers: res.offers}:l))
    }catch(err){
      console.warn('send offer failed', err.message)
    }
    return offer
  }

  async function setOfferStatus(listingId, offerId, status){
    try{
      const res = await updateOffer(listingId, offerId, status)
      setListings(arr=> arr.map(l=> l.id===listingId? {...l, offers: res.offers}:l))
    }catch(err){
      console.warn('offer status failed', err.message)
    }
  }

  const setStatus = async (id, status)=>{
    setListings(arr=> arr.map(l=> l.id===id? {...l, status}:l))
    try{
      await updateListing(id, { status })
    }catch(err){
      console.warn('status update failed', err.message)
    }
  }

  const remove = async (id)=>{
    setListings(arr=> arr.filter(l=> l.id!==id))
    try{
      await deleteListing(id)
    }catch(err){
      console.warn('delete failed', err.message)
    }
  }

  return (
    <ListingsContext.Provider value={{ listings, messagesByListing, getMessages, loadMessagesForListing, view, addChat, setSaved, savedSet, createListing, editListing, ensureThread, sendMessage, sendOffer, setOfferStatus, setStatus, remove, reload: loadListings }}>
      {children}
    </ListingsContext.Provider>
  )
}
