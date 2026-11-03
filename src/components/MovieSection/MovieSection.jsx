import MovieCard from '../MovieCard/MovieCard'

// Näyttää otsikon, tilaviestit ja elokuvalistan.
// layout: 'grid' (ruudukko) tai 'slider' (vaakasuunnassa selattava rivi).
function MovieSection({ title, movies, loading, error, layout = 'grid', emptyText }) {
  return (
    <section>
      <h2>{title}</h2>

      {loading && <p>Ladataan...</p>}
      {error && <p role="alert">{error}</p>}
      {!loading && !error && movies.length === 0 && (
        <p>{emptyText ?? 'Elokuvia ei löytynyt.'}</p>
      )}

      <div className={layout === 'slider' ? 'trending-slider' : 'movie-grid'}>
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </section>
  )
}

export default MovieSection