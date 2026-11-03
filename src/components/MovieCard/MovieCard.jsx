import { Link } from 'react-router-dom'

// Komponentti, joka näyttää yhden elokuvan tiedot korttina.
// movie sisältää backendin kautta TMDB:stä haetut elokuvatiedot.
function MovieCard({ movie }) {

  // Muodostetaan elokuvan julisteen URL-osoite.
  // TMDB palauttaa poster_path-arvon, joka on vain kuvan polku.
  // Lisäämme sen eteen TMDB:n kuvapalvelimen osoitteen.
  // Jos julistetta ei ole, posterUrl saa arvon null.
  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : null

  // Yhden elokuvakortin sisältävä elementti.
  // movie-card-luokkaa käytetään myöhemmin CSS-tyylittelyssä.
  // välitetään kortin tiedot suoraan myös tarkastelusivulle näytettäväksi
  return (
    <Link 
    to={`/movies/${movie.id}`}
    state={{ movie }} 
    className="movie-card">

      {/* Näytetään elokuvan juliste, jos se löytyy.
          Muussa tapauksessa näytetään ilmoitus puuttuvasta julisteesta. */}
      {posterUrl ? (
        <img src={posterUrl} alt={movie.title} />
      ) : (
        <p>Juliste puuttuu</p>
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