import { useContext, useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { UsersContext } from '../context/UsersContext'
export default function VerifyPage(){
  const [ok,setOk]=useState(false); const [p]=useSearchParams(); const nav=useNavigate(); const email=p.get('email')||''
  const { markVerified } = useContext(UsersContext)
  useEffect(()=>{ const t=setTimeout(()=> { markVerified(email); setOk(true) }, 800); return ()=>clearTimeout(t)},[])
  return (
    <div className='min-h-screen grid place-items-center'>
      <div className='card p-6 w-full max-w-md text-center space-y-2'>
        <div className='text-2xl font-semibold'>Email verification</div>
        <div className='text-sm text-gray-600'>We sent a link to <b>{email}</b></div>
        {ok? (<>
          <div className='text-green-700'>Verified! Your account is activated.</div>
          <button onClick={()=>nav('/login')} className='btn btn-dark w-full'>Go to Login</button>
        </>) : (<div>Waiting for confirmation…</div>)}
      </div>
    </div>
  )
}
