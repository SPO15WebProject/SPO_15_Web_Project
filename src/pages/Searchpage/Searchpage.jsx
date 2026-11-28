import useMovieSearch from '../../hooks/useMovieSearch'
import useMovieFilters from '../../hooks/useMovieFilters'
import useMovieSearchParams, {
  getSearchTitle
} from '../../hooks/useMovieSearchParams'
import { useBrowseScroll } from '../../hooks/useMovieBrowse'

import MovieSection from '../../components/MovieSection/MovieSection'
import MovieFilters from '../../components/MovieFilters/MovieFilters'

// Näytetään hakutulokset ja sivutuspainikkeet.
function SearchResults({ query, type, genre, filters }) {

  // Haetaan hakutulokset yhteisen hookin avulla.
  const {
    movies,
    page,
    loadedPage,
    loading,
    error,
    hasMore,
    loadMore,
    restartSearch
  } = useMovieSearch({ query, type, genre, filters })

  // Palautetaan aikaisempi vierityskohta.
  useBrowseScroll(loadedPage > 0)

  return (
    <div>

      {/* Hakutulokset */}
      <MovieSection
        showTitle={false}
        movies={movies}
        loading={loading && movies.length === 0}
        error={error}
        emptyText="Ei tuloksia"
      />

      {/* Seuraavan hakutulossivun lataaminen */}
      {hasMore && (
        <button
          type="button"
          className="load-more-button"
          disabled={loading || Boolean(error)}
          onClick={loadMore}
        >
          {loading ? 'Ladataan...' : 'Näytä lisää'}
        </button>
      )}

      {/* Haun uudelleenaloitus virhetilanteessa */}
      {error && page > 1 && (
        <button
          type="button"
          onClick={restartSearch}
        >
          Aloita haku uudelleen
        </button>
      )}

    </div>
  )
}

// Yhdistetään hakusuodattimet ja hakutulokset.
function FilteredSearchResults({ query, type, genre, country, language }) {

  const {
    filters,
    setFilters,
    activeFilters
  } = useMovieFilters(country, language)

  // Muodostetaan hakutulosten otsikko.
  const title = getSearchTitle({
    query,
    type,
    genre,
    filters: activeFilters
  })

  return (
    <div>

      {/* Hakusuodattimet */}
      <MovieFilters
        title={title}
        filters={filters}
        setFilters={setFilters}
        baseCountry={country}
        baseLanguage={language}
      />

      {/* Suodatetut hakutulokset */}
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

// Hakutulossivun pääkomponentti.
function SearchPage() {

  const {
    query,
    type,
    genre,
    country,
    language,
    searchKey,
    validationError
  } = useMovieSearchParams()

  // Näytetään virheilmoitus, jos hakutiedot ovat virheelliset.
  if (validationError) {
    return <p>{validationError}</p>
  }

  // Uusi haku saa oman selaustilansa.
  return (
    <FilteredSearchResults
      key={searchKey}
      query={query}
      type={type}
      genre={genre}
      country={country}
      language={language}
    />
  )
}

export default SearchPage