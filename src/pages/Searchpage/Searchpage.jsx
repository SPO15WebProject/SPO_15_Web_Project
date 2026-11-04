
import { useSearchParams } from 'react-router-dom'
import useMovies from '../../hooks/Usemovies'
import MovieSection from '../../components/MovieSection/MovieSection'

function SearchPage() {
  // Luetaan hakusana osoitteesta.
  const [searchParams] = useSearchParams()
  const query = searchParams.get('query') || ''

  // Haetaan elokuvat backendistä hakusanan perusteella.
  const endpoint = `/movies/search?query=${encodeURIComponent(query)}`
  const { movies, loading, error } = useMovies(endpoint)

  return (
    <div>
      {query.trim() ? (
        <MovieSection
          title={`Hakutulokset: ${query}`}
          movies={movies}
          loading={loading}
          error={error}
          emptyText="Ei tuloksia"
        />
      ) : (
        <p>Kirjoita elokuvan nimi yläreunan hakukenttään.</p>
      )}
    </div>
  )
}

export default SearchPage
