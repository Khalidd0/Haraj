import { Link } from 'react-router-dom'
export default function NotFound(){
  return (
    <div className='text-center py-24'>
      <h2 className='text-2xl font-semibold mb-2'>Page not found</h2>
      <p className='text-gray-500 mb-4'>The page you’re looking for doesn’t exist.</p>
      <Link to='/' className='bg-gray-900 text-white px-4 py-2 rounded'>Go Home</Link>
    </div>
  )
}
