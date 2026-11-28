import { useEffect, useState } from 'react'
import axios from 'axios'
import useMovieBrowse from './useMovieBrowse'

export default function useMovieSearch({ query, type, genre, filters }) {

  // Säilytetään hakutulokset ja ladatut sivut selaustilassa.
  const [saved, setSaved] = useMovieBrowse(
    `results:${JSON.stringify(filters)}`,
    {
      movies: [],
      page: 0,
      totalPages: 0
    }
  )

  const {
    movies,
    page: loadedPage,
    totalPages
  } = saved

  const [page, setPage] = useState(loadedPage || 1)
  const [loading, setLoading] = useState(loadedPage === 0)
  const [error, setError] = useState(null)

  // Tunnistetaan käyttäjän valitsema hakutapa.
  const isOriginSearch = type === 'country' || type === 'language'
  const isGenreSearch = type === 'genre'

  // Valitaan hakutavan mukainen rajapintareitti.
  const searchPath = isOriginSearch
    ? '/movies/search/origin'
    : isGenreSearch
      ? '/movies/search/genre'
      : type === 'actor'
        ? '/movies/search/actor'
        : '/movies/search'

  // Luetaan aktiiviset suodattimet.
  const {
    year,
    rating,
    sortBy,
    country,
    language,
    genres
  } = filters

  useEffect(() => {

    // Ei haeta uudelleen jo ladattua sivua.
    if (page === loadedPage) return

    const controller = new AbortController()

    const fetchMovies = async () => {
      setLoading(true)
      setError(null)

      try {

        // Muodostetaan hakutavan mukaiset parametrit.
        const params = isOriginSearch
          ? { page }
          : isGenreSearch
            ? { genre, page }
            : { query, page }

        // Lisätään aktiiviset suodattimet.
        if (year) params.year = year
        if (rating) params.rating = rating
        if (sortBy) params.sortBy = sortBy
        if (country) params.country = country
        if (language) params.language = language
        if (genres) params.genres = genres

        // Haetaan elokuvat backendista.
        const response = await axios.get(searchPath, {
          params,
          signal: controller.signal
        })

        if (controller.signal.aborted) return

        const newMovies = response.data.results || []

        // Yhdistetään uudet tulokset aikaisempiin.
        setSaved(previous => {

          const combinedMovies = page === 1
            ? newMovies
            : [...previous.movies, ...newMovies]

          // Poistetaan mahdolliset samat elokuvat.
          const uniqueMovies = [
            ...new Map(
              combinedMovies.map(movie => [movie.id, movie])
            ).values()
          ]

          return {
            movies: uniqueMovies,
            page,
            totalPages: response.data.total_pages || 0
          }
        })

      } catch (err) {
        if (!axios.isCancel(err) && !controller.signal.aborted) {
          console.error('Elokuvien hakeminen epäonnistui:', err)
          setError('Elokuvien hakeminen epäonnistui.')
        }

      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    fetchMovies()

    return () => controller.abort()

  }, [
    query,
    page,
    loadedPage,
    setSaved,
    searchPath,
    genre,
    isGenreSearch,
    isOriginSearch,
    country,
    language,
    year,
    rating,
    sortBy,
    genres
  ])

  // Tarkistetaan, onko lisää hakutuloksia saatavilla.
  const hasMore = page < totalPages && page < 500

  // Ladataan seuraava tulossivu.
  const loadMore = () => {
    if (!loading && !error && hasMore) {
      setPage(previous => previous + 1)
    }
  }

  // Aloitetaan haku uudelleen ensimmäiseltä sivulta.
  const restartSearch = () => {
    setSaved({
      movies: [],
      page: 0,
      totalPages: 0
    })

    setPage(1)
  }

  return {
    movies,
    page,
    loadedPage,
    loading,
    error,
    hasMore,
    loadMore,
    restartSearch
  }
}