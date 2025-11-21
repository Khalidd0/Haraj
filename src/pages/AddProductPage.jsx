import { useContext, useState } from 'react'
import { ListingsContext } from '../context/ListingsContext'
import { CATEGORIES } from '../data/categories'
import { PICKUP_ZONES } from '../data/pickupZones'
import { useNavigate } from 'react-router-dom'

export default function AddProductPage(){
  const { createListing } = useContext(ListingsContext)
  const nav = useNavigate()
  const [form, setForm] = useState({ title:'', description:'', price:'', categoryId:'1', condition:'Like New', zoneId:'1', image:'' })
  const set = (k)=>(e)=> setForm(f=> ({...f, [k]: e.target.value}))
  function submit(e){
    e.preventDefault()
    if(!form.title || !form.price) return alert('Fill in title and price')
    createListing({ id: Date.now(), title: form.title, price: Number(form.price), categoryId: Number(form.categoryId), condition: form.condition, zoneId: Number(form.zoneId), images: [form.image || 'https://images.unsplash.com/photo-1518779578993-ec3579fee39f'], seller:{id:'me', name:'You', rating:5}, createdAt:new Date().toISOString(), favorite:false, status:'active', description: form.description || 'No description' })
    nav('/')
  }
  return (
    <div className='grid lg:grid-cols-12 gap-6'>
      <div className='lg:col-span-8'>
        <div className='card p-4 space-y-3'>
          <h2 className='text-xl font-semibold'>Add your product</h2>
          <label className='text-sm'>Enter the Product Title</label>
          <input className='input' value={form.title} onChange={set('title')} />
          <label className='text-sm'>Enter the Product Description</label>
          <textarea className='input' rows='4' value={form.description} onChange={set('description')} />
          <label className='text-sm'>Enter the Product Price</label>
          <input className='input' type='number' value={form.price} onChange={set('price')}/>
          <div className='grid sm:grid-cols-3 gap-3'>
            <div><label className='text-sm'>Category</label><select className='input' value={form.categoryId} onChange={set('categoryId')}>{CATEGORIES.map(c=> <option key={c.id} value={String(c.id)}>{c.name}</option>)}</select></div>
            <div><label className='text-sm'>Condition</label><select className='input' value={form.condition} onChange={set('condition')}>{['New','Like New','Very Good','Good','Acceptable'].map(v=> <option key={v} value={v}>{v}</option>)}</select></div>
            <div><label className='text-sm'>Pickup Zone</label><select className='input' value={form.zoneId} onChange={set('zoneId')}>{PICKUP_ZONES.map(z=> <option key={z.id} value={String(z.id)}>{z.name}</option>)}</select></div>
          </div>
        </div>
      </div>
      <aside className='lg:col-span-4'>
        <div className='card p-4 space-y-3'>
          <div className='border-2 border-dashed rounded-lg h-60 grid place-items-center text-gray-500'>
            <div className='text-center'>Drag and Drop here<br/>or<br/><label className='underline cursor-pointer'>Select file</label></div>
          </div>
          <input className='input' placeholder='Image URL (demo)' value={form.image} onChange={set('image')} />
          <button className='btn btn-primary w-full' onClick={submit}>POST</button>
        </div>
      </aside>
    </div>
  )
}
