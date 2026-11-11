import { Link } from 'react-router-dom'

// Komponentti, joka näyttää yhden elokuvan tiedot korttina.
// movie sisältää backendin kautta TMDB:stä haetut elokuvatiedot.
function MovieCard({ movie }) {

  // Muodostetaan elokuvan julisteen URL-osoite.
  // Jos elokuvalla ei ole julistetta, posterUrl on null.
  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : null

  return (
    <Link
      to={`/movies/${movie.id}`}
      state={{ movie }}
      className="movie-card"
    >

      {/* Jos juliste löytyy, näytetään se normaalisti.
          Muuten näytetään samankokoinen placeholder. */}
      {posterUrl ? (
        <img src={posterUrl} alt={movie.title} />
      ) : (
        <div className="movie-placeholder">
          <span>Ei julistekuvaa</span>
        </div>
      )}

      {/* Elokuvan nimi */}
      <h3>{movie.title}</h3>

      {/* Elokuvan julkaisuvuosi */}
      <p>
        Vuosi: {movie.release_date?.slice(0, 4) || 'Ei tiedossa'}
      </p>

      {/* Elokuvan arvosana */}
      <p>
        Arvosana: {movie.vote_average?.toFixed(1) ?? 'Ei tiedossa'}
      </p>

    </Link>
  )
}

export default MovieCard
