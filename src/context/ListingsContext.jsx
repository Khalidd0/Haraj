import { createContext, useState } from 'react'
import { MOCK_LISTINGS } from '../data/listings'

export const ListingsContext = createContext()

export function ListingsProvider({ children }){
  const [listings, setListings] = useState(MOCK_LISTINGS.map(l=> ({...l, metrics:{views:0,saves:0,chats:0}, offers:[], messages:[]})))

  const view = (id)=> setListings(arr=> arr.map(l=> l.id===id? {...l, metrics:{...l.metrics, views:l.metrics.views+1}}:l))
  const addChat = (id)=> setListings(arr=> arr.map(l=> l.id===id? {...l, metrics:{...l.metrics, chats:l.metrics.chats+1}}:l))
  const toggleFav = (id)=> setListings(arr=> arr.map(l=> l.id===id? {...l, favorite: !l.favorite, metrics:{...l.metrics, saves:l.favorite? l.metrics.saves-1 : l.metrics.saves+1}}:l))
  const createListing = (l)=> setListings(arr=> [{...l, metrics:{views:0,saves:0,chats:0}, offers:[], messages:[]}, ...arr])

  // --- Chat + Offer system ---
  function ensureThread(id){
    setListings(arr=> arr.map(l=> l.id===id? l : l)) // noop; placeholder for future persistence
    return true
  }
  function sendMessage(id, from, text){
    setListings(arr=> arr.map(l=> l.id===id? {...l, messages:[...l.messages, {id:Date.now(), from, text, type:'message', at:new Date().toISOString()}]}:l))
    addChat(id)
  }
  function sendOffer(id, from, price){
    const offer = { id: Date.now(), by: from, price, status:'Pending', at:new Date().toISOString() }
    setListings(arr=> arr.map(l=> l.id===id? {...l, offers:[...l.offers, offer], messages:[...l.messages, {id:offer.id+1, from, text:`Offer: SAR ${price}`, type:'offer', at:new Date().toISOString()}]}:l))
    addChat(id)
    return offer
  }
  function setOfferStatus(listingId, offerId, status){
    setListings(arr=> arr.map(l=> l.id===listingId? {...l, offers:l.offers.map(o=> o.id===offerId? {...o, status}:o), messages:[...l.messages, {id:Date.now(), from:'system', type:'status', text:`Offer ${status}`, at:new Date().toISOString()}]}:l))
  }
  const setStatus = (id, status)=> setListings(arr=> arr.map(l=> l.id===id? {...l, status}:l))

  return (
    <ListingsContext.Provider value={{ listings, view, addChat, toggleFav, createListing, ensureThread, sendMessage, sendOffer, setOfferStatus, setStatus }}>
      {children}
    </ListingsContext.Provider>
  )
}
