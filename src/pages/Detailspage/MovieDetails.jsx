import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import useMovies from "../../hooks/Usemovies";
import { useAuth } from "../../context/AuthContext";
import "./MovieDetails.css";


function MovieDetails() {
  // Luetaan elokuvan ID sivun osoitteesta
  const { id } = useParams();
  const location = useLocation();
  const { user, clearUser } = useAuth();

  // Arvostelulomakkeen kentät ja käyttäjälle näytettävä palaute.
  const [stars, setStars] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [message, setMessage] = useState("");
  const [reviews, setReviews] = useState([]);
  // Ohjaa näyttelijälistan laajentamista ja supistamista.
  const [showAllActors, setShowAllActors] = useState(false);

  // Palautetaan lista supistetuksi, kun elokuvan ID vaihtuu.
  useEffect(() => {
    setShowAllActors(false);
  }, [id]);

  // Muokattavan arvostelun ID ja lomakkeen väliaikaiset arvot.
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editedText, setEditedText] = useState("");
  const [editedStars, setEditedStars] = useState(0);

  // Hook hakee elokuvan ja katsoo lataus- ja virhetilan
  const { movies: movie, loading, error } = useMovies(`/movies/${id}`);

  // Kortilta saadut tiedot ovat heti käytettävissä
  const passedMovie = location.state?.movie;

  // Näytetään vain osoitteen ID:tä vastaavan elokuvan tietoja.
  const previewMovie =
    passedMovie && String(passedMovie.id) === id ? passedMovie : null;

  const fetchedMovie = movie && String(movie.id) === id ? movie : null;

  // Käytetään uusimpia tietoja tai kortin tietoja
  const displayedMovie = fetchedMovie ?? previewMovie;
  // Kopioidaan vain näyttelijät (cast), ei työryhmää (crew), ja järjestetään nimet A–Ö.
  const actors = [...(fetchedMovie?.credits?.cast ?? [])]
    .sort((a, b) => a.name.localeCompare(b.name, "fi"));
  // Näytetään joko kaikki näyttelijät tai aakkosjärjestyksen 10 ensimmäistä.
  const visibleActors = showAllActors ? actors : actors.slice(0, 10);

  // Rakennetaan nykyisen genrehaun URL genren ID:n ja nimen avulla.
  const getGenreSearchLink = (genre) => {
    const params = new URLSearchParams({
      type: "genre", genre: String(genre.id), query: genre.name
    });
    return `/search?${params.toString()}`;
  };

  // Rakennetaan nykyisen näyttelijähaun URL näyttelijän nimen avulla.
  const getActorSearchLink = (actor) => {
    const params = new URLSearchParams({ query: actor.name, type: "actor" });
    return `/search?${params.toString()}`;
  };

  // Muodostetaan julisteen osoite TMDB:n kuvapolusta.
  const posterUrl = displayedMovie?.poster_path
    ? `https://image.tmdb.org/t/p/w500${displayedMovie.poster_path}`
    : null;


  // Lähetetään uusi arvostelu lomakkeelta backendille.
  const handleReviewSubmit = async (e) => {
    e.preventDefault();

    try {  //Lähetetään arvostelu ja istuntoeväste backendille
      const response = await fetch(
        `/api/db/CreateReview`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            movieId: displayedMovie.id,
            stars: Number(stars),
            text: reviewText,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        // Eväste on vanhentunut -> päivitetään käyttöliittymä uloskirjautuneeksi
        if (response.status === 401) clearUser();
        setMessage(data.error || "Arvostelun lähetys epäonnistui.");
        return;
      }

      //Tyjennetään lomake ja päivitetään arvostelulista
      setMessage("Arvostelu lisätty onnistuneesti!");
      setStars("");
      setReviewText("");

      fetchReviews();
    } catch (error) {
      console.error("Review error", error);

      setMessage(
        `${error.code || ""} ${error.detail || error.message || "Virhe"}`
      );
    }
  };
  //Haetaan arvostelut tietokannasta
  const fetchReviews = async () => {
    try {
      const response = await fetch(
        `/api/db/GetReviewsByMovie/${displayedMovie.id}`
      );

      const data = await response.json();

      console.log(JSON.stringify(data, null, 2));

      setReviews(data.reviews || []);
    } catch (error) {
      console.error("Virhe arvostelujen haussa:", error);
    }
  };

  //Arvostelun poistaminen
  const handleDeleteReview = async (reviewId) => {
    const confirmed = window.confirm(
      "Haluatko varmasti poistaa tämän arvostelun?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `/api/db/DeleteReview/${reviewId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Arvostelun poistaminen epäonnistui.");
      }

      setReviews((prevReviews) =>
        prevReviews.filter((review) => review.id !== reviewId)
      );
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  //Arvostelun muokkaaminen
  const handleEditReview = (review) => {
    setEditingReviewId(review.id);
    setEditedText(review.text || "");
    setEditedStars(review.stars);
  };

  // Tallennetaan muokatun arvostelun tiedot backendille.
  const handleSaveReview = async (reviewId) => {
    try {
      const response = await fetch(
        `/api/db/UpdateReview/${reviewId}`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            stars: editedStars,
            text: editedText,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Muokkaus epäonnistui");
      }

      setReviews((prevReviews) =>
        prevReviews.map((review) =>
          review.id === reviewId ? data : review
        )
      );

      setEditingReviewId(null);
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  //Haetaan arvostelut aina kun elova vaihtuu/latautuu
  useEffect(() => {
    if (displayedMovie?.id) {
      fetchReviews();
    }
  }, [displayedMovie]);

  return (
    <section className="movie-details">
      {/* Linkki takaisin etusivulle. */}
      <Link to="/">Takaisin etusivulle</Link>

      {/* latausviesti siltä varalta jos näytettäviä tietoja ei ole */}
      {loading && !displayedMovie && <p>Ladataan elokuvan tietoja...</p>}

      {/* virhe ilmoitetaan myös silloin, kun kortin tiedot näkyy */}
      {error && <p role="alert">{error}</p>}

      {/* Elokuvan infokortti näytetään vain, jos elokuvan tiedot ovat saatavilla. */}
      {displayedMovie && (
        <div className="movie-info-panel">
          {/* Yläosan asettelu: juliste ja perustiedot vierekkäin CSS:n avulla. */}
          <div className="movie-header">
            {/* Julisteen oma alue. Jos kuva puuttuu, näytetään korvaava teksti. */}
            <div className="movie-details-poster">
              {posterUrl ? (
                <img src={posterUrl} alt={displayedMovie.title} width="500" height="750" />
              ) : <p>Juliste puuttuu</p>}
            </div>
            {/* Perustiedot julisteen vieressä: nimi, vuosi, arvosana, genret ja kuvaus. */}
            <div className="movie-meta">
              <h1>{displayedMovie.title}</h1>
              <p>Vuosi: {displayedMovie.release_date?.slice(0, 4) || "Ei tiedossa"}</p>
              <p>Arvosana: {displayedMovie.vote_average?.toFixed(1) ?? "Ei tiedossa"}</p>
              {/* Genret ja kesto näytetään vasta, kun tarkemmat tiedot on haettu. */}
              {/* Näyttelijäosio sijoitetaan julisteen ja perustietojen alapuolelle. */}
          {fetchedMovie && (
                <>
                  {/* Genreosion ulompi säiliö sisältää otsikon ja hakulinkit. */}
                  <div className="movie-detail-genres">
                    <strong>Genret</strong>
                    {/* Map käy genret läpi ja luo jokaiselle linkin nykyiseen genrehakuun. */}
                    {/* Jokainen näkyvä näyttelijä saa oman linkin nykyiseen näyttelijähakuun. */}
                  <div className="movie-detail-links">
                      {fetchedMovie.genres?.length > 0 ? fetchedMovie.genres.map(genre => (
                        <Link key={genre.id} to={getGenreSearchLink(genre)} className="movie-detail-search-link">
                          {genre.name}
                        </Link>
                      )) : <span>Ei tiedossa</span>}
                    </div>
                  </div>
                  <p>Kesto: {fetchedMovie.runtime > 0 ? `${fetchedMovie.runtime} min` : "Ei tiedossa"}</p>
                </>
              )}
              {/* Elokuvan kuvaus tai korvaava teksti, jos kuvaus puuttuu. */}
              <h2>Kuvaus</h2>
              <p>{displayedMovie.overview || "Kuvausta ei saatavilla"}</p>
            </div>
          </div>
          {fetchedMovie && (
            <section className="movie-detail-actors">
              <h2>Näyttelijät</h2>
              {/* Jos näyttelijöitä löytyy, näytetään nimilinkit ja tarvittaessa laajennuspainike. */}
              {actors.length > 0 ? (
                <>
                  <div className="movie-detail-links">
                    {visibleActors.map(actor => (
                      <Link key={actor.credit_id || actor.id} to={getActorSearchLink(actor)} className="movie-detail-search-link">
                        {actor.name}
                      </Link>
                    ))}
                  </div>
                  {/* Painike tarvitaan vain, jos näyttelijöitä on yli 10. Klikkaus vaihtaa listan tilan. */}
                  {actors.length > 10 && (
                    <button type="button" className="movie-detail-actors-toggle" aria-expanded={showAllActors}
                      onClick={() => setShowAllActors(previous => !previous)}>
                      {showAllActors ? "Näytä vähemmän" : `Näytä kaikki näyttelijät (${actors.length})`}
                    </button>
                  )}
                </>
              ) : <p>Tietoja ei saatavilla</p>}
            </section>
          )}
        </div>
      )}

      {/* Arvostelualue sisältää kirjoituslomakkeen ja käyttäjien arvostelut. */}
      {displayedMovie && (
        <div className="reviews-container">

          {/* Arvostelun kirjoittamiseen varattu alue. */}
          <div className="review-section">
            <h2>Kirjoita arvostelu</h2>

            {/* Kirjautunut käyttäjä näkee lomakkeen, muut kirjautumislinkin. */}
            {user ? (
              <form onSubmit={handleReviewSubmit}>
                <label>Arvosana (0-10)</label>

                {/* Arvosanakenttä päivittää stars-tilaa käyttäjän kirjoittaessa. */}
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={stars}
                  onChange={(e) => setStars(e.target.value)}
                />

                <label>Arvostelu</label>

                {/* Tekstikenttä päivittää arvostelun sisältöä Reactin tilaan. */}
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                />
                {/* Lähetyspainike käynnistää lomakkeen handleReviewSubmit-funktion. */}
                <button type="submit">
                  Lähetä arvostelu
                </button>

                {/* Näytetään lähetyksen onnistumis- tai virheilmoitus, jos sellainen on. */}
                {message && <p>{message}</p>}
              </form>
            ) : (
              <p>
                <Link to="/Login">
                  Kirjaudu sisään jättääksesi arvostelun.
                </Link>
              </p>
            )}
          </div>


          {/* Tietokannasta haettujen arvostelujen lista. */}
          <div className="reviews-list">
            <h2>Käyttäjien arvostelut</h2>

            {/* Tyhjä lista näyttää ilmoituksen; muuten map luo jokaiselle arvostelulle kortin. */}
            {reviews.length === 0 ? (
              <p>Ei arvosteluja vielä.</p>
            ) : (
              reviews.map((review) => (
                <div key={review.id} className="review-card">
                  <h3>{review.stars}/10</h3>

                  {/* Vain valittu arvostelu näytetään muokkaustilassa. */}
                  {editingReviewId === review.id ? (
                    <>
                      {/* Muokkauskenttä sisältää arvostelun väliaikaisen tekstin. */}
                      <textarea
                        className="edit-review-textarea"
                        value={editedText}
                        onChange={(e) => setEditedText(e.target.value)}
                      />

                      {/* Muokattavan arvostelun arvosanakenttä. */}
                      <input
                        className="edit-stars-input"
                        type="number"
                        min="0"
                        max="10"
                        value={editedStars}
                        onChange={(e) => setEditedStars(Number(e.target.value))}
                      />

                      {/* Muokkaustilan painikkeet tallentavat tai peruuttavat muutokset. */}
                      <div className="review-action-buttons">
                        <button
                          className="save-review-btn"
                          onClick={() => handleSaveReview(review.id)}
                        >
                          Tallenna
                        </button>

                        <button
                          className="cancel-review-btn"
                          onClick={() => setEditingReviewId(null)}
                        >
                          Peruuta
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Normaalitilassa näytetään arvosteluteksti ja kirjoittajan nimimerkki. */}
                      <p>{review.text}</p>

                      <small>{review.nickname}</small>

                      {/* Muokkaus- ja poistopainikkeet näytetään vain arvostelun omistajalle. */}
                      {user && review.userid === user.userid && (
                        <div className="review-action-buttons">
                          <button
                            className="edit-review-btn"
                            onClick={() => handleEditReview(review)}
                          >
                            Muokkaa
                          </button>

                          <button
                            className="delete-review-btn"
                            onClick={() => handleDeleteReview(review.id)}
                          >
                            Poista arvostelu
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))
            )}
          </div>

        </div>
      )}
    </section>
  );
}

export default MovieDetails;