import useBrowseMovies from '../../hooks/useBrowseMovies'
import { useBrowseScroll } from '../../hooks/useMovieBrowse'
import MovieSection from '../../components/MovieSection/MovieSection'

function PopularPage() {
  const { movies, loading, error } = useBrowseMovies('/movies/popular')

  useBrowseScroll(!loading)

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