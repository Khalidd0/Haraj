import { useContext, useState } from 'react'
import { ListingsContext } from '../context/ListingsContext'
import { CategoryContext } from '../context/CategoryContext'
import { PICKUP_ZONES } from '../data/pickupZones'
import { useNavigate } from 'react-router-dom'
import { uploadImage } from '../api/uploads'

export default function AddProductPage(){
  const { createListing } = useContext(ListingsContext)
  const { categories } = useContext(CategoryContext)
  const nav = useNavigate()
  const [form, setForm] = useState({ title:'', description:'', price:'', categoryId:'1', condition:'Like New', zoneId:String(PICKUP_ZONES[0].id), zoneNote:'' })
  const [images, setImages] = useState([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const set = (k)=>(e)=> setForm(f=> ({...f, [k]: e.target.value}))
  const removeImage = (idx)=> setImages(arr=> arr.filter((_,i)=> i!==idx))

  async function submit(e){
    e.preventDefault()
    try{
      if(!form.title || !form.price) throw new Error('Fill in title and price')
      const urls = images.map(i=>i.trim()).filter(Boolean)
      if(!urls.length) throw new Error('Please upload at least one image')
      await createListing({
        title: form.title,
        description: form.description || 'No description',
        price: Number(form.price),
        categoryId: Number(form.categoryId),
        condition: form.condition,
        zoneId: Number(form.zoneId),
        pickupNote: form.zoneId === String(999) ? (form.zoneNote || '').trim() : '',
        images: urls
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
              <div><label className='text-sm'>Category</label><select className='input' value={form.categoryId} onChange={set('categoryId')}>{categories.map(c=> <option key={c.id} value={String(c.id)}>{c.name}</option>)}</select></div>
              <div><label className='text-sm'>Condition</label><select className='input' value={form.condition} onChange={set('condition')}>{['New','Like New','Very Good','Good','Acceptable'].map(v=> <option key={v} value={v}>{v}</option>)}</select></div>
              <div><label className='text-sm'>Pickup Zone</label><select className='input' value={form.zoneId} onChange={set('zoneId')}>{PICKUP_ZONES.map(z=> <option key={z.id} value={String(z.id)}>{z.name}</option>)}</select></div>
              {form.zoneId === String(999) && (
                <div className='sm:col-span-3'>
                  <label className='text-sm'>Other pickup location</label>
                  <input
                    className='input'
                    value={form.zoneNote}
                    onChange={set('zoneNote')}
                    placeholder='e.g. Building 838, Spokes Hub, etc.'
                  />
                </div>
              )}
            </div>
        </div>
      </div>
      <aside className='lg:col-span-4'>
        <div className='card p-4 space-y-3'>
          <div className='flex items-center justify-between'>
            <div className='font-semibold'>Upload images</div>
            <label className='text-sm underline cursor-pointer'>
              Select files
              <input type='file' accept='image/*' multiple className='hidden' onChange={onFilesSelected}/>
            </label>
          </div>
          <div className='space-y-1'>
            {images.map((url, idx)=>(
              <div key={idx} className='flex items-center justify-between bg-gray-50 border rounded px-2 py-1 text-sm'>
                <span className='truncate max-w-[75%]' title={url}>{url}</span>
                <button type='button' onClick={()=>removeImage(idx)} className='text-sm underline text-red-600'>Remove</button>
              </div>
            ))}
            {!images.length && <div className='text-xs text-gray-500'>No images yet. Upload JPG/PNG up to 5MB each.</div>}
          </div>
          <div className='text-xs text-gray-500'>{uploading ? 'Uploading...' : 'Images are stored locally under /uploads.'}</div>
          {error && <div className='text-sm text-red-600'>{error}</div>}
          <button className='btn btn-primary w-full' onClick={submit} disabled={uploading}>POST</button>
        </div>
      </aside>
    </div>
  )
}
