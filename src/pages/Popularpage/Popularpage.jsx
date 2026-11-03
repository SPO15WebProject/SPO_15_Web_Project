import useMovies from '../../hooks/Usemovies'
import MovieSection from '../../components/MovieSection/MovieSection'

function PopularPage() {
  const { movies, loading, error } = useMovies('/movies/popular')

  return (
    <MovieSection
      title="Suositut elokuvat"
      movies={movies}
      loading={loading}
      error={error}
    />
  )
}

export default PopularPage