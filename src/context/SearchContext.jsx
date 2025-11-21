import { createContext, useState } from 'react';
export const SearchContext = createContext();
export function SearchProvider({ children }){
  const [term, setTerm] = useState('');
  return <SearchContext.Provider value={{ term, setTerm }}>{children}</SearchContext.Provider>;
}
