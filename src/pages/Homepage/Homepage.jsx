import { Link } from 'react-router-dom'
import useMovies from '../../hooks/Usemovies'
import MovieSection from '../../components/MovieSection/MovieSection'

    function HomePage() {
  const trending = useMovies('/movies/trending')
  const popular = useMovies('/movies/popular')

  return (
    <>
      <h1>SPO_15</h1>

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