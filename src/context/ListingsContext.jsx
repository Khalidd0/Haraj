import { createContext, useContext, useEffect, useState } from 'react'
import { listListings, createListing as apiCreate, incrementMetric, sendListingMessage, createOffer, updateOffer, updateListing, deleteListing } from '../api/listings'
import { getApiBase } from '../api/client'
import { AuthContext } from './AuthContext'

export const ListingsContext = createContext()

function normalizeListing(l) {
  const offers = Array.isArray(l.offers) ? l.offers.map(o => ({ ...o, id: o._id || o.id, by: o.by?.toString?.() || o.by })) : []
  const messages = Array.isArray(l.messages) ? l.messages.map(m => ({ ...m, id: m._id || m.id, from: m.from?.toString?.() || m.from, fromName: m.fromName })) : []
  const id = l._id || l.id
  const sellerId = l.seller?.id || l.seller?._id
  return {
    id,
    favorite: false,
    metrics: { views: 0, saves: 0, chats: 0, ...(l.metrics || {}) },
    offers,
    messages,
    ...l,
    images: Array.isArray(l.images) ? l.images.map(addBase) : [],
    seller: l.seller ? { ...l.seller, id: sellerId } : l.seller
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

  useEffect(() => { loadListings() }, [])

  async function loadListings() {
    try{
      const res = await listListings()
      setListings(res.listings.map(normalizeListing))
    }catch(err){
      console.error('Failed to load listings', err.message)
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

  const toggleFav = (id)=> setListings(arr=> arr.map(l=> l.id===id? {...l, favorite: !l.favorite, metrics:{...l.metrics, saves:l.favorite? l.metrics.saves-1 : l.metrics.saves+1}}:l))

  const createListing = async (payload)=>{
    const res = await apiCreate(payload)
    setListings(arr=> [normalizeListing(res.listing), ...arr])
    return res.listing
  }

  function ensureThread(id){
    setListings(arr=> arr.map(l=> l.id===id? l : l))
    return true
  }

  async function sendMessage(id, from, text){
    if (!user) throw new Error('Login required')
    const sender = from || user.id
    setListings(arr=> arr.map(l=> l.id===id? {...l, messages:[...l.messages, {id:Date.now(), from:sender, text, type:'message', at:new Date().toISOString()}]}:l))
    addChat(id)
    try{
      await sendListingMessage(id, text)
    }catch(err){
      console.warn('send message failed', err.message)
    }
  }

  async function sendOffer(id, from, price){
    if (!user) throw new Error('Login required')
    const by = from || user.id
    const offer = { id: Date.now(), by, price, status:'Pending', at:new Date().toISOString() }
    setListings(arr=> arr.map(l=> l.id===id? {...l, offers:[...l.offers, offer], messages:[...l.messages, {id:offer.id+1, from, text:`Offer: SAR ${price}`, type:'offer', at:new Date().toISOString()}]}:l))
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
      setListings(arr=> arr.map(l=> l.id===listingId? {...l, offers: res.offers, messages:[...l.messages, {id:Date.now(), from:'system', type:'status', text:`Offer ${status}`, at:new Date().toISOString()}]}:l))
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
    <ListingsContext.Provider value={{ listings, view, addChat, toggleFav, createListing, ensureThread, sendMessage, sendOffer, setOfferStatus, setStatus, remove, reload: loadListings }}>
      {children}
    </ListingsContext.Provider>
  )
}
