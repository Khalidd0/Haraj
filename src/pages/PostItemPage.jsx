import { useContext, useState } from 'react'
import { ListingsContext } from '../context/ListingsContext'
import { CategoryContext } from '../context/CategoryContext'
import { PICKUP_ZONES } from '../data/pickupZones'
import { useNavigate } from 'react-router-dom'
import { uploadImage } from '../api/uploads'

export default function PostItemPage(){
  const { createListing } = useContext(ListingsContext)
  const { categories } = useContext(CategoryContext)
  const nav = useNavigate()
  const [form, setForm] = useState({ title:'', price:'', categoryId:'1', condition:'Like New', zoneId:'1', description:'' })
  const [images, setImages] = useState([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  async function submit(e){
    e.preventDefault()
    try{
      if(!form.title || !form.price || Number(form.price)<=0) throw new Error('Provide title and valid price')
      const urls = images.map(i=>i.trim()).filter(Boolean)
      if(!urls.length) throw new Error('Please upload at least one image')
      await createListing({
        title: form.title,
        price: Number(form.price),
        categoryId: Number(form.categoryId),
        condition: form.condition,
        zoneId: Number(form.zoneId),
        images: urls,
        description: form.description || 'No description'
      })
      nav('/')
    }catch(err){ setError(err.message) }
  }

  async function onFilesSelected(e){
    const files = Array.from(e.target.files || [])
    if(!files.length) return
    setUploading(true)
    try{
      const uploaded = []
      for (const f of files) {
        const url = await uploadImage(f)
        uploaded.push(url)
      }
      setImages(arr=> [...arr, ...uploaded])
    }catch(err){ setError(err.message) } finally { setUploading(false) }
  }

  const set = (k)=>(e)=> setForm(f=> ({...f, [k]: e.target.value}))
  const removeImage = (idx)=> setImages(arr=> arr.filter((_,i)=> i!==idx))

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
              {categories.map(c=> <option key={c.id} value={String(c.id)}>{c.name}</option>)}
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
        <div className='space-y-2'>
          <div className='flex items-center justify-between'>
            <label className='text-sm'>Upload photos</label>
            <label className='text-sm underline cursor-pointer'>
              Select files
              <input type='file' accept='image/*' multiple className='hidden' onChange={onFilesSelected}/>
            </label>
          </div>
          <div className='space-y-1'>
            {images.map((url, idx)=> (
              <div key={idx} className='flex items-center justify-between bg-gray-50 border rounded px-2 py-1 text-sm'>
                <span className='truncate max-w-[75%]' title={url}>{url}</span>
                <button type='button' onClick={()=>removeImage(idx)} className='text-red-600 text-xs underline'>Remove</button>
              </div>
            ))}
            {!images.length && <div className='text-xs text-gray-500'>No images yet. Upload JPG/PNG up to 5MB each.</div>}
          </div>
          <div className='text-xs text-gray-500'>{uploading ? 'Uploading...' : 'Images are stored locally under /uploads.'}</div>
        </div>
        <div>
          <label className='text-sm'>Description</label>
          <textarea rows='4' value={form.description} onChange={set('description')} className='mt-1 border rounded w-full px-3 py-2'/>
        </div>
        {error && <div className='text-sm text-red-600'>{error}</div>}
        <div className='flex items-center justify-between'>
          <button className='bg-gray-900 text-white px-4 py-2 rounded' disabled={uploading}>Publish</button>
          <div className='text-xs text-gray-500'>Visible to KFUPM accounts only.</div>
        </div>
      </form>
    </div>
  )
}
