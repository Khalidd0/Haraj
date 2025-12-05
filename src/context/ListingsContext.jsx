import { createContext, useContext, useEffect, useState } from 'react'
import { listListings, createListing as apiCreate, incrementMetric, sendListingMessage, createOffer, updateOffer, updateListing, deleteListing, listMessages, getSaved, saveListing, unsaveListing } from '../api/listings'
import { getApiBase } from '../api/client'
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
  const fromId = m.from?.toString?.() || m.from
  const toId = m.to?.toString?.() || m.to
  return {
    ...m,
    id: m._id || m.id,
    from: fromId,
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

  useEffect(() => { loadListings() }, [])
  useEffect(() => { if(user) loadSaved(); else setSavedSet(new Set()) }, [user?.id])

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
      const msgs = Array.isArray(res.messages) ? res.messages.map(normalizeMessage) : []
      setMessagesByListing(map => ({ ...map, [listingId]: msgs }))
      return msgs
    }catch(err){
      console.error('Failed to load messages', err.message)
      return []
    }
  }

  function getMessages(listingId){
    return messagesByListing[listingId] || []
  }

  async function sendMessage(id, from, text, to){
    if (!user) throw new Error('Login required')
    const sender = from || user.id
    const optimistic = { id: Date.now(), from: sender, to, fromName: user.name, text, type: 'message', at: new Date().toISOString() }
    setMessagesByListing(map => ({ ...map, [id]: [...(map[id] || []), optimistic] }))
    addChat(id)
    try{
      await sendListingMessage(id, text, to)
    }catch(err){
      console.warn('send message failed', err.message)
    }
  }

  async function sendOffer(id, from, price){
    if (!user) throw new Error('Login required')
    const by = from || user.id
    const offer = { id: Date.now(), by, byName:user.name, price, status:'Pending', at:new Date().toISOString() }
    setListings(arr=> arr.map(l=> l.id===id? {...l, offers:[...l.offers, offer]}:l))
    addChat(id)
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
