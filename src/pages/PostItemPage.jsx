import { useContext, useState } from 'react'
import { ListingsContext } from '../context/ListingsContext'
import { CATEGORIES } from '../data/categories'
import { PICKUP_ZONES } from '../data/pickupZones'
import { useNavigate } from 'react-router-dom'

export default function PostItemPage(){
  const { createListing } = useContext(ListingsContext)
  const nav = useNavigate()
  const [form, setForm] = useState({ title:'', price:'', categoryId:'1', condition:'Like New', zoneId:'1', image:'', description:'' })
  const [error, setError] = useState('')

  function submit(e){
    e.preventDefault()
    if(!form.title || !form.price || Number(form.price)<=0) return setError('Provide title and valid price')
    createListing({
      id: Math.floor(Math.random()*100000),
      title: form.title,
      price: Number(form.price),
      categoryId: Number(form.categoryId),
      condition: form.condition,
      zoneId: Number(form.zoneId),
      images: [form.image || 'https://images.unsplash.com/photo-1518779578993-ec3579fee39f'],
      seller: { id: 'me', name: 'You', rating: 5 },
      createdAt: new Date().toISOString(),
      favorite: false,
      status: 'active',
      description: form.description || 'No description'
    })
    nav('/')
  }

  const set = (k)=>(e)=> setForm(f=> ({...f, [k]: e.target.value}))

  return (
    <div className='max-w-3xl mx-auto'>
      <form onSubmit={submit} className='bg-white border rounded-lg p-4 grid gap-3'>
        <h2 className='text-xl font-semibold'>Post an Item</h2>
        <div>
          <label className='text-sm'>Title</label>
          <input value={form.title} onChange={set('title')} className='mt-1 border rounded w-full px-3 py-2' />
        </div>
        <div>
          <label className='text-sm'>Price (SAR)</label>
          <input type='number' value={form.price} onChange={set('price')} className='mt-1 border rounded w-full px-3 py-2' />
        </div>
        <div className='grid sm:grid-cols-3 gap-3'>
          <div>
            <label className='text-sm'>Category</label>
            <select value={form.categoryId} onChange={set('categoryId')} className='mt-1 border rounded w-full px-3 py-2'>
              {CATEGORIES.map(c=> <option key={c.id} value={String(c.id)}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className='text-sm'>Condition</label>
            <select value={form.condition} onChange={set('condition')} className='mt-1 border rounded w-full px-3 py-2'>
              {['New','Like New','Very Good','Good','Acceptable'].map(v=> <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className='text-sm'>Pickup Zone</label>
            <select value={form.zoneId} onChange={set('zoneId')} className='mt-1 border rounded w-full px-3 py-2'>
              {PICKUP_ZONES.map(z=> <option key={z.id} value={String(z.id)}>{z.name}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className='text-sm'>Photo URL (for demo)</label>
          <input value={form.image} onChange={set('image')} className='mt-1 border rounded w-full px-3 py-2' placeholder='https://…'/>
          <div className='text-xs text-gray-500 mt-1'>Accepts JPG/PNG ≤ 5MB (simulated)</div>
        </div>
        <div>
          <label className='text-sm'>Description</label>
          <textarea rows='4' value={form.description} onChange={set('description')} className='mt-1 border rounded w-full px-3 py-2'/>
        </div>
        {error && <div className='text-sm text-red-600'>{error}</div>}
        <div className='flex items-center justify-between'>
          <button className='bg-gray-900 text-white px-4 py-2 rounded'>Publish</button>
          <div className='text-xs text-gray-500'>Visible to KFUPM accounts only.</div>
        </div>
      </form>
    </div>
  )
}
