import { Link, NavLink } from 'react-router-dom'
import { useContext } from 'react'
import { NotiContext } from '../../context/NotiContext'
import { AuthContext } from '../../context/AuthContext'
  import { SearchContext } from '../../context/SearchContext'

const NavItem = ({to, children}) => (
  <NavLink to={to} className={({isActive})=> `nav-link ${isActive? 'bg-white/10' : ''}`}>
    {children}
  </NavLink>
)

export default function Header(){
  const { notis } = useContext(NotiContext)
  const unread = notis.filter(n=>!n.read).length
  const { user, logout } = useContext(AuthContext)
    const { term, setTerm } = useContext(SearchContext)
  return (
    <header className="sticky top-0 z-30">
      <div className="bg-[var(--brand)]">
        <div className="container-px py-3 flex items-center gap-4">
          <Link to={user ? '/' : '/'} className="text-white font-semibold text-xl">Haraj Petroly</Link>
          <div className="flex-1 hidden md:flex items-center gap-2">
            {user && <>
              <input className="w-full rounded px-3 py-2" placeholder="Search products..." value={term} onChange={e=>setTerm(e.target.value)}/>
              <div className="flex items-center gap-2">
                <span className="pill">New</span>
                <span className="pill">Used</span>
                <span className="pill">KFUPM</span>
              </div>
            </>}
          </div>
          <nav className="ml-auto hidden md:flex items-center gap-2">
            {!user && (<>
              <NavItem to="/login">Sign In</NavItem>
              <NavItem to="/signup">Sign Up</NavItem>
            </>)}
            {user && (<>
              <NavItem to="/">Home</NavItem>
              <NavItem to="/messages">Messages</NavItem>
              <NavItem to="/profile">Profile</NavItem>
              <NavItem to="/saved">Saved</NavItem>
              <Link to="/notifications" className="relative nav-link">🔔
                {unread>0 && <span className="absolute -top-2 -right-2 bg-[var(--accent)] text-[10px] rounded-full px-1">{unread}</span>}
              </Link>
              <button className="nav-link" onClick={logout}>Logout</button>
            </>)}
          </nav>
        </div>
      </div>
    </header>
  )
}
