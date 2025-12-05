import { Link } from 'react-router-dom';
import { useContext } from 'react'
import { AuthContext } from '../../context/AuthContext'
import SearchBar from '../ui/SearchBar';

export default function Header(){
  const { user, logout } = useContext(AuthContext)
  return (
    <header className="bg-[var(--brand)] text-white">
      <div className="container-px py-3 flex items-center gap-6">
        <Link to="/" className="text-2xl font-bold">Haraj Petroly</Link>
        <SearchBar />
        <div className="flex items-center gap-4 ml-auto text-sm">
          <Link to="/" className="hover:underline">Home</Link>
          <Link to="/messages" className="hover:underline">Messages</Link>
          <Link to="/profile" className="hover:underline">Profile</Link>
          <Link to="/saved" className="hover:underline">Saved</Link>
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
