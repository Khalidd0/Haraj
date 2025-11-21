import { useContext } from 'react'
import { ListingsContext } from '../context/ListingsContext'
import { NotiContext } from '../context/NotiContext'
import ListingCard from '../components/ui/ListingCard'

export default function SavedPage(){
  const { listings, toggleFav } = useContext(ListingsContext)
  const { addNoti } = useContext(NotiContext)
  const saved = listings.filter(l=>l.favorite)
  function unsave(id){ toggleFav(id); addNoti('Removed from saved items') }
  return (
    <div>
      <h2 className='text-xl font-semibold mb-3'>Saved Items</h2>
      {saved.length===0? <div className='text-gray-500'>Nothing saved yet.</div> : (
        <div className='grid sm:grid-cols-2 lg:grid-cols-3 gap-4'>
          {saved.map(l=> <ListingCard key={l.id} item={l} onSave={unsave} />)}
        </div>
      )}
    </div>
  )
}
