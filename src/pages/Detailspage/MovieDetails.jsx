import { useLocation, useParams, useNavigate } from "react-router-dom";
import useMovies from "../../hooks/Usemovies";

import MovieInformation from "./MovieInformation";
import MovieCast from "./MovieCast";
import MovieReviews from "./MovieReviews";

import "./MovieDetails.css";

// Elokuvan infosivun pääkomponentti.
function MovieDetails() {

  // Luetaan elokuvan ID sivun osoitteesta.
  const { id } = useParams();

  // Palataan selaushistorian edelliselle sivulle.
  const navigate = useNavigate();
  const location = useLocation();

  // Hook hakee elokuvan ja katsoo lataus- ja virhetilan.
  const {
    movies: movie,
    loading,
    error
  } = useMovies(`/movies/${id}`);

  // Kortilta saadut tiedot ovat heti käytettävissä.
  const passedMovie = location.state?.movie;

  // Näytetään vain osoitteen ID:tä vastaavan elokuvan tietoja.
  const previewMovie =
    passedMovie && String(passedMovie.id) === id
      ? passedMovie
      : null;

  const fetchedMovie =
    movie && String(movie.id) === id
      ? movie
      : null;

  // Käytetään uusimpia tietoja tai kortin tietoja.
  const displayedMovie = fetchedMovie ?? previewMovie;

  return (
    <section className="movie-details">

      {/* Palataan edelliselle sivulle. */}
      <button
        type="button"
        className="movie-back-button"
        onClick={() => navigate(-1)}
      >
        ← Takaisin
      </button>

      {/* Latausviesti, jos näytettäviä tietoja ei ole. */}
      {loading && !displayedMovie && (
        <p>Ladataan elokuvan tietoja...</p>
      )}

      {/* Virhe ilmoitetaan myös silloin, kun kortin tiedot näkyvät. */}
      {error && <p role="alert">{error}</p>}

      {/* Elokuvan perustiedot ja näyttelijät. */}
      {displayedMovie && (
        <div className="movie-info-panel">

          <MovieInformation
            displayedMovie={displayedMovie}
            fetchedMovie={fetchedMovie}
          />

          {fetchedMovie && (
            <MovieCast
              key={id}
              movie={fetchedMovie}
            />
          )}

        </div>
      )}

      {/* Arvostelulomake ja käyttäjien arvostelut. */}
      {displayedMovie && (
        <MovieReviews displayedMovie={displayedMovie} />
      )}

    </section>
  );
}

export default MovieDetails;