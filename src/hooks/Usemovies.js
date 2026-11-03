import { useState, useEffect } from 'react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL

/**
 * Hook joka etsii valitusta TMDB endpointista elokuva datan
 * @param {*} endpoint tmdb endpoint, e.g ./movies/popular
 * @returns {*} movies: data obj / loading: onko tiedot ladattu / error: error message 
 */
export default function useMovies(endpoint) {
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const controller = new AbortController()

    const fetchMovies = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await axios.get(`${API_URL}${endpoint}`, {
          signal: controller.signal,
        })
        setMovies(response.data)
      } catch (err) {
        if (axios.isCancel(err)) return /*axios cancel ei oikea error*/

        console.error('Elokuvien hakeminen epäonnistui:', err)
        setError('Elokuvien hakeminen epäonnistui.')
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    fetchMovies()

    return () => controller.abort()
  }, [endpoint])

  return { movies, loading, error }
}