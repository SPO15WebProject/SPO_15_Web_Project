import useMovies from '../../hooks/UseMovies'
import MovieSection from '../../components/MovieSection/MovieSection'

// Sivu, jolla näytetään kaikki viikon trendaavat elokuvat.
function TrendingPage() {
  const { movies, loading, error } = useMovies('/movies/trending')

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