import { Link } from 'react-router-dom'
import useBrowseMovies from '../../hooks/useBrowseMovies'
import { useBrowseScroll } from '../../hooks/useMovieBrowse'
import MovieSection from '../../components/MovieSection/MovieSection'

function HomePage() {
  const trending = useBrowseMovies('/movies/trending')
  const popular = useBrowseMovies('/movies/popular')

  useBrowseScroll(!trending.loading && !popular.loading)

  return (
    <>
      <MovieSection
        title="Trendaavat elokuvat"
        movies={trending.movies}
        loading={trending.loading}
        error={trending.error}
        layout="slider"
        emptyText="Trendaavia elokuvia ei löytynyt."
      />

      <Link to="/trending">Näytä kaikki trendaavat</Link>

      <MovieSection
        title="Suositut elokuvat"
        movies={popular.movies.slice(0, 8)}
        loading={popular.loading}
        error={popular.error}
      />

      <Link to="/popular">Näytä kaikki suositut</Link>
    </>
  )
}

export default HomePage