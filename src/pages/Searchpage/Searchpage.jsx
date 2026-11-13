import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import axios from 'axios'
import MovieSection from '../../components/MovieSection/MovieSection'

// Komponentti, joka hakee tuloksia sivu kerrallaan.
function SearchResults({ query, type, genre }) {

  // Hakutulokset ja sivutustiedot.
  const [movies, setMovies] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)

  // Latauksen ja virheiden hallinta.
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const isActorSearch = type === 'actor'
  const isGenreSearch = type === 'genre'

  // Valitaan oikea backend-reitti.
  const searchPath = isGenreSearch
    ? '/movies/search/genre'
    : isActorSearch
      ? '/movies/search/actor'
      : '/movies/search'

  useEffect(() => {
    const controller = new AbortController()

    const fetchMovies = async () => {
      setLoading(true)
      setError(null)

      try {
        // Genrehaussa käytetään genren tunnistetta,
        // muissa hakutavoissa hakusanaa.
        const params = isGenreSearch
          ? { genre, page }
          : { query, page }

        // Haetaan vain haluttu tulossivu.
        const response = await axios.get(searchPath, {
          params,
          signal: controller.signal
        })

        if (controller.signal.aborted) return

        const newMovies = response.data.results || []

        setMovies(previousMovies => {
          // Ensimmäinen sivu aloittaa uuden listan.
          if (page === 1) {
            return newMovies
          }

          // Muut sivut lisätään olemassa oleviin tuloksiin.
          // Estetään saman elokuvan näyttäminen kahdesti.
          const existingIds = new Set(
            previousMovies.map(movie => movie.id)
          )

          const uniqueMovies = newMovies.filter(
            movie => !existingIds.has(movie.id)
          )

          return [...previousMovies, ...uniqueMovies]
        })

        // Tallennetaan sivujen kokonaismäärä.
        setTotalPages(response.data.total_pages || 0)

      } catch (err) {
        if (axios.isCancel(err) || controller.signal.aborted) {
          return
        }

        console.error('Elokuvahaku epäonnistui:', err)
        setError('Elokuvien lataaminen epäonnistui.')

      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    fetchMovies()

    // Perutaan vanha pyyntö tarvittaessa.
    return () => controller.abort()

  }, [query, page, searchPath, genre, isGenreSearch])

  // Tarkistetaan, onko seuraavia sivuja.
  const hasMore = page < totalPages

  // Valitaan hakutulosten otsikko hakutavan perusteella.
  const title = isGenreSearch
    ? `Genre: ${query || genre}`
    : isActorSearch
      ? `Näyttelijän ${query} elokuvat`
      : `Hakutulokset: ${query}`

  return (
    <div>
      <MovieSection
        title={title}
        movies={movies}
        loading={loading && movies.length === 0}
        error={error}
        emptyText="Ei tuloksia"
      />

      {/* Näytä lisää -painike kaikille hakutavoille */}
      {hasMore && (
        <button
          type="button"
          className="load-more-button"
          disabled={loading || Boolean(error)}
          onClick={() => {
            setPage(previousPage => previousPage + 1)
          }}
        >
          {loading ? 'Ladataan...' : 'Näytä lisää'}
        </button>
      )}

      {/* Jos lisäsivun lataus epäonnistuu,
          käyttäjä voi yrittää uudelleen. */}
      {error && page > 1 && (
        <button
          type="button"
          onClick={() => {
            // Palataan ensimmäiseen sivuun,
            // jotta haku voidaan aloittaa uudelleen.
            setMovies([])
            setPage(1)
          }}
        >
          Aloita haku uudelleen
        </button>
      )}
    </div>
  )
}

function SearchPage() {
  // Luetaan hakusana, hakutapa ja genren tunniste osoitteesta.
  const [searchParams] = useSearchParams()

  const query = searchParams.get('query') || ''
  const genre = searchParams.get('genre') || ''

  const type = searchParams.get('type') === 'genre'
    ? 'genre'
    : searchParams.get('type') === 'actor'
      ? 'actor'
      : 'movie'

  // Tarkistetaan, että genrehaussa on valittu genre.
  if (type === 'genre' && !genre) {
    return <p>Valitse genre hakukentästä.</p>
  }

  // Muissa hakutavoissa tarvitaan hakusana.
  if (type !== 'genre' && !query.trim()) {
    return (
      <p>
        Kirjoita elokuvan tai näyttelijän nimi hakukenttään.
      </p>
    )
  }

  // key varmistaa, että uusi hakusana, hakutapa tai genre
  // aloittaa sivutuksen aina ensimmäiseltä sivulta.
  return (
    <SearchResults
      key={`${type}:${query}:${genre}`}
      query={query}
      type={type}
      genre={genre}
    />
  )
}

export default SearchPage