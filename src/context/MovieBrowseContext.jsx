import { useState } from 'react'
import { MovieBrowseContext } from '../hooks/useMovieBrowse'

// Provider pysyy paikallaan, vaikka reitti vaihtuu.
export function MovieBrowseProvider({ children }) {
  const [store] = useState(() => new Map())
  return (
    <MovieBrowseContext.Provider value={store}>
      {children}
    </MovieBrowseContext.Provider>
  )
}