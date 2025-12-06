import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { listPublicRules } from '../api/rules'

export default function LandingPage(){
  const nav = useNavigate()
  const [rules, setRules] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    listPublicRules()
      .then(res => setRules(res.rules || []))
      .catch(err => setError(err.message || 'Failed to load announcements'))
  }, [])

  return (
    <div className="min-h-[72vh] grid place-items-center">
      <div className="text-center space-y-6 max-w-3xl mx-auto px-4">
        <h1 className="text-5xl md:text-6xl font-semibold text-[var(--brand)]">Haraj Petroly</h1>
        <p className="text-lg text-gray-600">
          Buy and sell within the KFUPM community easily and safely.
        </p>
        {error && <div className="text-sm text-red-600">{error}</div>}
        {rules.length > 0 && (
          <div className="bg-white border rounded-lg p-4 text-left space-y-2">
            <div className="text-sm font-semibold text-gray-700">Marketplace rules & announcements</div>
            {rules.map(rule => (
              <div key={rule.id || rule._id} className="text-xs text-gray-700 border-t pt-2 first:border-t-0 first:pt-0">
                <div className="font-semibold">{rule.title}</div>
                <div className="whitespace-pre-line">{rule.body}</div>
              </div>
            ))}
          </div>
        )}
        <div className="flex items-center justify-center gap-4">
          <button className="btn btn-dark px-5 py-3 text-lg" onClick={()=>nav('/login')}>Sign In</button>
          <button className="btn btn-primary px-5 py-3 text-lg" onClick={()=>nav('/signup')}>Create Account</button>
        </div>
      </div>
    </div>
  )
}
