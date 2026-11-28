import useBrowseMovies from '../../hooks/useBrowseMovies'
import { useBrowseScroll } from '../../hooks/useMovieBrowse'
import MovieSection from '../../components/MovieSection/MovieSection'

// Sivu, jolla näytetään kaikki viikon trendaavat elokuvat.
function TrendingPage() {
  const { movies, loading, error } = useBrowseMovies('/movies/trending')

  useBrowseScroll(!loading)

  return (
    <MovieSection
      title="Trendaavat elokuvat"
      movies={movies}
      loading={loading}
      error={error}
      emptyText="Trendaavia elokuvia ei löytynyt."
    />
  )
}

export default TrendingPage