import { useNavigate } from 'react-router-dom'

export default function LandingPage(){
  const nav = useNavigate()
  return (
    <div className="min-h-[72vh] grid place-items-center">
      <div className="text-center space-y-6">
        <h1 className="text-5xl md:text-6xl font-semibold text-[var(--brand)]">Haraj Petroly</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Buy and sell within the KFUPM community easily and safely.
        </p>
        <div className="flex items-center justify-center gap-4">
          <button className="btn btn-dark px-5 py-3 text-lg" onClick={()=>nav('/login')}>Sign In</button>
          <button className="btn btn-primary px-5 py-3 text-lg" onClick={()=>nav('/signup')}>Create Account</button>
        </div>
      </div>
    </div>
  )
}
