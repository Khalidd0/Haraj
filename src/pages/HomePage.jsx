import { useContext, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ListingsContext } from '../context/ListingsContext'
import { SearchContext } from '../context/SearchContext'
import ListingCard from '../components/ui/ListingCard'
import PaginationBar from '../components/ui/PaginationBar'
import { CATEGORIES } from '../data/categories'

export default function HomePage() {
  const { listings, toggleFav } = useContext(ListingsContext)
  const { term } = useContext(SearchContext)
  const [search, setSearch] = useState('')
  const [cat, setCat] = useState('all')
  const [sort, setSort] = useState('new')

  const filtered = useMemo(() => {
    let arr = [...listings]

    // text search
    if (search)
      arr = arr.filter(l =>
        l.title.toLowerCase().includes(search.toLowerCase())
      )

    // global search term (from header)
    if (term) {
      const lower = term.toLowerCase()
      arr = arr.filter(l =>
        (l.title + ' ' + (l.description || '')).toLowerCase().includes(lower) ||
        (l.condition && l.condition.toLowerCase().includes(lower))
      )
    }

    // category filter
    if (cat !== 'all')
      arr = arr.filter(l => String(l.categoryId) === String(cat))

    // sorting
    if (sort === 'new')
      arr.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
    if (sort === 'priceAsc') arr.sort((a, b) => a.price - b.price)
    if (sort === 'priceDesc') arr.sort((a, b) => b.price - a.price)

    return arr
  }, [listings, search, cat, sort, term])

  return (
    <div className='grid grid-cols-1 md:grid-cols-12 gap-6'>
      {/* sidebar */}
      <aside className='md:col-span-3'>
        <div className='bg-white border rounded-lg p-4 space-y-3'>
          <div>
            <label className='text-sm'>Search</label>
            <div className='mt-1'>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder='calculator, chair…'
                className='border rounded w-full px-3 py-2'
              />
            </div>
          </div>
          <div>
            <label className='text-sm'>Category</label>
            <select
              value={cat}
              onChange={e => setCat(e.target.value)}
              className='mt-1 border rounded w-full px-3 py-2'
            >
              <option value='all'>All</option>
              {CATEGORIES.map(c => (
                <option key={c.id} value={String(c.id)}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className='text-sm'>Sort by</label>
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              className='mt-1 border rounded w-full px-3 py-2'
            >
              <option value='new'>Newest</option>
              <option value='priceAsc'>Price ↑</option>
              <option value='priceDesc'>Price ↓</option>
            </select>
          </div>
        </div>
      </aside>

      {/* listings */}
      <section className='md:col-span-9'>
        <div className='mb-3 flex items-center justify-between'>
          <h2 className='text-xl font-semibold'>{filtered.length} results</h2>
          <Link
            to='/post'
            className='bg-gray-900 text-white px-3 py-2 rounded text-sm'
          >
            Post Item
          </Link>
        </div>

        <div className='grid sm:grid-cols-2 lg:grid-cols-3 gap-4'>
          {filtered.map(l => (
            <ListingCard key={l.id} item={l} onSave={toggleFav} />
          ))}
        </div>

        {!filtered.length && (
          <p className='text-gray-500 mt-4'>
            No listings yet. Be the first to post something!
          </p>
        )}

        <PaginationBar />
      </section>
    </div>
  )
}
