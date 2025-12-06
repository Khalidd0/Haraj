import { useContext, useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

export default function LoginPage(){
  const nav = useNavigate(); const { login, user } = useContext(AuthContext)
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [error, setError]=useState('')
  const submit = async (e) => {
    e.preventDefault()
    try {
      if (!email.endsWith('@kfupm.edu.sa')) throw new Error('Use @kfupm.edu.sa')
      if (password.length < 8 || !(/[a-z]/i.test(password) && /\d/.test(password))) throw new Error('Password must be >=8 with letters & digits')
      const user = await login({ email, password })
      nav(user?.role === 'admin' ? '/admin' : '/')
    } catch (err) {
      setError(err.message)
    }
  }
  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/'} replace />
  return (
    <div className="min-h-[78vh] grid md:grid-cols-2 gap-8 container-px">
      <div className="hidden md:flex flex-col justify-center">
        <div className="mx-auto max-w-xl bg-white rounded-lg p-12 shadow-sm">
          <h2 className="text-3xl font-semibold text-[var(--brand)] mb-3">Buy and Sell Within KFUPM</h2>
          <p className="text-gray-600">Community-based marketplace for safe on-campus trading.</p>
        </div>
      </div>
      <div className="flex items-center justify-center">
        <form onSubmit={submit} className="card p-6 w-full max-w-md space-y-3">
          <div className="text-2xl font-semibold text-center">Login</div>
          <div>
            <label className="text-sm">KFUPM Email</label>
            <input className="input" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@kfupm.edu.sa"/>
          </div>
          <div>
            <label className="text-sm">Password</label>
            <input type="password" className="input" value={password} onChange={e=>setPassword(e.target.value)} />
          </div>
          {error && <div className="text-sm text-red-600">{error}</div>}
          <button className="btn btn-dark w-full">Login</button>
          <button type="button" onClick={()=>nav('/signup')} className="underline text-sm w-full text-center">Create account</button>
        </form>
      </div>
    </div>
  )
}
