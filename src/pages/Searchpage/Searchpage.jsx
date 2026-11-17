import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import axios from 'axios'
import MovieSection from '../../components/MovieSection/MovieSection'
import MovieFilters from '../../components/MovieFilters/MovieFilters'

// Komponentti, joka hakee tuloksia sivu kerrallaan.
function SearchResults({ query, type, genre, filters }) {

  // Hakutulokset ja sivutustiedot.
  const [movies, setMovies] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)

  // Tieto hakutulosten rajoittamisesta.
  const [truncated, setTruncated] = useState(false)

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

  const { year, rating, sortBy } = filters

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

        // Lisätään kaikki suodattimet ja järjestystapa
        // backendille kaikissa hakutavoissa.
        if (year) params.year = year
        if (rating) params.rating = rating
        if (sortBy) params.sortBy = sortBy

        // Haetaan valmiiksi suodatettu ja järjestetty tulossivu.
        const response = await axios.get(searchPath, {
          params,
          signal: controller.signal
        })

        if (controller.signal.aborted) return

        const newMovies = response.data.results || []

        setMovies(previousMovies => {

          // Ensimmäinen sivu aloittaa uuden listan.
          if (page === 1) return newMovies

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

        // Tallennetaan tieto hakutulosten rajoittamisesta.
        setTruncated(response.data.truncated === true)

      } catch (err) {
        if (axios.isCancel(err) || controller.signal.aborted) return

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

  }, [
    query,
    page,
    searchPath,
    genre,
    isGenreSearch,
    year,
    rating,
    sortBy
  ])

  // Tarkistetaan, onko seuraavia sivuja.
  const hasMore = page < totalPages && page < 500

  return (
    <div>

      {/* Ilmoitetaan, jos kaikkia hakutuloksia ei käsitelty. */}
      {truncated && !error && (
        <p className="search-limit-notice" role="status">
          Hakutuloksia on paljon. Suodatus ja järjestäminen
          koskevat vain osaa hakutuloksista.
          Tarkenna hakusanaa tai julkaisuvuotta.
        </p>
      )}

      {/* Backend palauttaa valmiiksi suodatetut
          ja järjestetyt elokuvat. */}
      <MovieSection
        showTitle={false}
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

// Hallitaan suodattimia erillään hakutuloksista.
function FilteredSearchResults({ query, type, genre }) {

  // Suodattimien nykyiset arvot.
  const [filters, setFilters] = useState({
    year: '',
    rating: '',
    sortBy: ''
  })

  // Käytetään vain kelvollista julkaisuvuotta.
  const activeFilters = {
    ...filters,
    year: /^\d{4}$/.test(filters.year) &&
      Number(filters.year) >= 1900
      ? filters.year
      : ''
  }

  // Valitaan hakutulosten otsikko hakutavan perusteella.
  const title = type === 'genre'
    ? `Genre: ${query || genre}`
    : type === 'actor'
      ? `Näyttelijän ${query} elokuvat`
      : `Hakutulokset: ${query}`

  return (
    <div>

      {/* Elokuvien suodattimet ja hakutulosten otsikko */}
      <MovieFilters
        title={title}
        filters={filters}
        setFilters={setFilters}
      />

      {/* Suodattimen tai järjestystavan vaihtaminen
          aloittaa sivutuksen alusta. */}
      <SearchResults
        key={JSON.stringify(activeFilters)}
        query={query}
        type={type}
        genre={genre}
        filters={activeFilters}
      />

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
    return <p>Kirjoita elokuvan tai näyttelijän nimi hakukenttään.</p>
  }

  // key varmistaa, että uusi hakusana, hakutapa tai genre
  // aloittaa sivutuksen aina ensimmäiseltä sivulta.
  return (
    <FilteredSearchResults
      key={`${type}:${query}:${genre}`}
      query={query}
      type={type}
      genre={genre}
    />
  )
}

export default SearchPage