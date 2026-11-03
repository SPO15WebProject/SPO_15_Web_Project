import { useState, useEffect } from 'react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL

/**
 * Hook joka etsii yhden elokuvan tiedot backendistä ID:n perusteella
 * @param {string} id Elokuvan id, esim: 1423191
 * @returns {{ movie: Object|null, loading: boolean, error: string|null }} elokuvan tiedot, lataustila ja mahdollinen virheviesti
 */
export default function useMovie(id) {
  const [movie, setMovie] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const controller = new AbortController()

    const fetchMovie = async () => {
      setLoading(true)
      setError(null)
      setMovie(null)

      try {
        const response = await axios.get(`${API_URL}/movies/${id}`, {
          signal: controller.signal,
        })
        setMovie(response.data)
      } catch (err) {
        if (axios.isCancel(err)) return /*axios cancel ei oikea error*/

        setError('Elokuvan tietojen hakeminen epäonnistui.')
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    fetchMovie()

    return () => controller.abort()
  }, [id])

  return { movie, loading, error }
}