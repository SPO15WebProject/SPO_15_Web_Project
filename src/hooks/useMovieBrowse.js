import { createContext, useContext, useState, useLayoutEffect } from 'react'
import { useLocation } from 'react-router-dom'

export const MovieBrowseContext = createContext(null)

// Tallennetaan tila historiakohdan ja käyttökohteen mukaan.
// Komponentin key vaihtuu, kun käyttäjä aloittaa uuden haun.
export default function useMovieBrowse(name, initialValue) {
  const store = useContext(MovieBrowseContext)
  const { key } = useLocation()
  const cacheKey = JSON.stringify([key, name])

  const [value, setValue] = useState(() =>
    store.has(cacheKey) ? store.get(cacheKey) : initialValue
  )

  // Tallennetaan vain Reactin vahvistama tila,
  // ei kesken jäänyttä renderöintiä.
  useLayoutEffect(() => {
    store.set(cacheKey, value)
  }, [store, cacheKey, value])

  return [value, setValue]
}

// Palautetaan vieritys, kun tallennetut tulokset
// ovat jälleen näkyvissä.
export function useBrowseScroll(ready = true) {
  const store = useContext(MovieBrowseContext)
  const { key } = useLocation()

  useLayoutEffect(() => {
    if (!ready) return

    const cacheKey = JSON.stringify([key, 'scroll'])
    const saved = store.get(cacheKey)

    window.scrollTo(0, saved?.y ?? 0)

    const slider = document.querySelector('.trending-slider')

    if (slider) slider.scrollLeft = saved?.x ?? 0

    const save = () => store.set(cacheKey, {
      y: window.scrollY,
      x: slider?.scrollLeft ?? 0
    })

    window.addEventListener('scroll', save, { passive: true })
    slider?.addEventListener('scroll', save, { passive: true })

    return () => {
      window.removeEventListener('scroll', save)
      slider?.removeEventListener('scroll', save)
    }
  }, [store, key, ready])
}