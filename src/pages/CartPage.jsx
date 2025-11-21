import { useContext } from 'react'
import { ListingsContext } from '../context/ListingsContext'
import { money } from '../utils/formatters'

export default function CartPage(){
  const { listings } = useContext(ListingsContext)
  const items = listings.slice(0,3)
  const total = items.reduce((s,i)=> s+i.price, 0)
  return (
    <div className='grid lg:grid-cols-12 gap-6'>
      <section className='lg:col-span-8 card p-4'>
        <h2 className='text-lg font-semibold mb-2'>Shopping Continue</h2>
        <div className='space-y-3'>
          {items.map(i=> (
            <div key={i.id} className='flex items-center gap-3 border rounded p-2'>
              <img src={i.images[0]} className='h-14 w-14 object-cover rounded'/>
              <div className='flex-1'>
                <div className='font-medium'>{i.title}</div>
                <div className='text-sm text-gray-500'>{money(i.price)}</div>
              </div>
              <div className='flex items-center gap-2'>
                <button className='border rounded px-2'>-</button>
                <span>1</span>
                <button className='border rounded px-2'>+</button>
              </div>
              <button className='border rounded p-2'>🗑</button>
            </div>
          ))}
        </div>
      </section>
      <aside className='lg:col-span-4 card p-4 space-y-3'>
        <div className='font-semibold'>Card Details</div>
        <input className='input' placeholder='Cardholder Name'/>
        <input className='input' placeholder='Card Number'/>
        <div className='grid grid-cols-2 gap-2'>
          <input className='input' placeholder='MM/YY'/>
          <input className='input' placeholder='CVV'/>
        </div>
        <div className='flex items-center justify-between'><div>Total</div><div className='font-semibold'>{money(total)}</div></div>
        <button className='btn btn-primary w-full'>Checkout</button>
      </aside>
    </div>
  )
}
