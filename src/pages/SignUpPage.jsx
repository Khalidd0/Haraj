import { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

export default function SignUpPage(){
  const nav = useNavigate()
  const { register } = useContext(AuthContext)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  async function submit(e){
    e.preventDefault()
    try{
      if(!email.endsWith('@kfupm.edu.sa')) throw new Error('Email must end with @kfupm.edu.sa')
      if(password.length < 8 || !(/[a-z]/i.test(password)&&/\d/.test(password))) throw new Error('Password must be >=8 with letters & digits')
      await register({ name, email, password })
      nav('/verify?email='+encodeURIComponent(email))
    }catch(err){ setError(err.message) }
  }
  return (
    <div className='min-h-screen grid place-items-center p-6'>
      <form onSubmit={submit} className='card p-6 w-full max-w-md space-y-3'>
        <div className='text-2xl font-semibold'>Sign Up</div>
        <input className='input' placeholder='Full name' value={name} onChange={e=>setName(e.target.value)} />
        <input className='input' placeholder='you@kfupm.edu.sa' value={email} onChange={e=>setEmail(e.target.value)} />
        <input type='password' className='input' placeholder='Password' value={password} onChange={e=>setPassword(e.target.value)} />
        {error && <div className='text-sm text-red-600'>{error}</div>}
        <button className='btn btn-primary w-full'>Create account</button>
      </form>
    </div>
  )
}
