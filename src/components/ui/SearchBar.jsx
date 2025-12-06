import { useContext } from 'react'
import { SearchContext } from '../../context/SearchContext'

export default function SearchBar(){
  const { term, setTerm } = useContext(SearchContext)
  return (
    <input
      className="rounded-md px-3 py-2 text-sm w-64 input"
      placeholder="Search prod"
      value={term}
      onChange={e=>setTerm(e.target.value)}
    />
  )
}
