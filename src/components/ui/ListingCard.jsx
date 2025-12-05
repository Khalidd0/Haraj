import { Link } from 'react-router-dom';
import { money } from '../../utils/formatters';
import { CATEGORIES } from '../../data/categories';

export default function ListingCard({ item, onSave }){
  const status = item.status && item.status !== 'active' ? item.status : null;
  return (
    <div className="card overflow-hidden">
      <Link to={`/listing/${item.id}`}>
        <div className="aspect-[16/9] bg-gray-100 relative flex items-center justify-center">
          {status && <span className="absolute top-2 left-2 text-xs bg-black/70 text-white rounded px-2 py-0.5 capitalize">{status}</span>}
          <img src={item.images?.[0]} className="max-h-full max-w-full object-contain"/>
        </div>
      </Link>
      <div className="p-3 space-y-1">
        <div className="flex items-center justify-between">
          <Link to={`/listing/${item.id}`} className="font-medium hover:underline line-clamp-1">{item.title}</Link>
          <span className="text-xs bg-[var(--brand)] text-white rounded px-2 py-0.5">{CATEGORIES.find(c=>c.id===item.categoryId)?.name}</span>
        </div>
        <div className="text-sm font-semibold">{money(item.price)}</div>
        <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
        <div className="flex justify-between pt-1">
          <button onClick={()=>onSave(item.id)} className="text-xs underline">{item.favorite ? 'Unsave' : 'Save'}</button>
          <Link to={`/listing/${item.id}`} className="text-xs underline">View details</Link>
        </div>
      </div>
    </div>
  );
}
