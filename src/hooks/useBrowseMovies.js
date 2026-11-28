import { useEffect, useState } from 'react'
import axios from 'axios'
import useMovieBrowse from './useMovieBrowse'

// Elokuvalista säilyy historiakohdassa,
// mutta uusi käynti hakee tuoreet tiedot.
export default function useBrowseMovies(endpoint) {
  const [saved, setSaved] = useMovieBrowse(endpoint, null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (saved !== null) return

    const controller = new AbortController()

    axios.get(endpoint, { signal: controller.signal })

      .then(({ data }) => {
        if (!controller.signal.aborted) setSaved(data)
      })

      .catch(() => {
        if (!controller.signal.aborted) {
          setError('Elokuvien hakeminen epäonnistui.')
        }
      })

    return () => controller.abort()

  }, [endpoint, saved, setSaved])

  return {
    movies: saved ?? [],
    loading: saved === null && !error,
    error
  }
}