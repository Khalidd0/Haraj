import { Link } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../../context/AuthContext'
import SearchBar from '../ui/SearchBar';

const THEME_KEY = 'hp_theme'

export default function Header(){
  const { user, logout } = useContext(AuthContext)
  const [theme, setTheme] = useState(() => localStorage.getItem(THEME_KEY) || 'light')

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem(THEME_KEY, theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(t => (t === 'dark' ? 'light' : 'dark'))
  }

  return (
    <header className="bg-[var(--brand)] text-white">
      <div className="container-px py-3 flex items-center gap-6">
        <Link to="/" className="text-2xl font-bold">Haraj Petroly</Link>
        <SearchBar />
        <div className="flex items-center gap-4 ml-auto text-sm">
          {user?.role === 'admin' ? (
            <>
              <Link to="/admin" className="hover:underline font-semibold">Admin</Link>
              <Link to="/" className="hover:underline">Marketplace</Link>
              <Link to="/profile" className="hover:underline">Profile</Link>
            </>
          ) : (
            <>
              <Link to="/" className="hover:underline">Home</Link>
              {user && <Link to="/messages" className="hover:underline">Messages</Link>}
              {user && <Link to="/profile" className="hover:underline">Profile</Link>}
              {user && <Link to="/saved" className="hover:underline">Saved</Link>}
            </>
          )}
          <button
            type="button"
            onClick={toggleTheme}
            className="hover:underline text-xs md:text-sm"
          >
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </button>
          {user ? (
            <button onClick={logout} className="hover:underline">Logout</button>
          ) : (
            <Link to="/login" className="hover:underline">Login</Link>
          )}
        </div>
      </div>
    </header>
  );
}
