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

  const [stars, setStars] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [message, setMessage] = useState("");
  const [reviews, setReviews] = useState([]);

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

  const posterUrl = displayedMovie?.poster_path
    ? `https://image.tmdb.org/t/p/w500${displayedMovie.poster_path}`
    : null;


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
      <Link to="/">Takaisin etusivulle</Link>

      {/* latausviesti siltä varalta jos näytettäviä tietoja ei ole */}
      {loading && !displayedMovie && <p>Ladataan elokuvan tietoja...</p>}

      {/* virhe ilmoitetaan myös silloin, kun kortin tiedot näkyy */}
      {error && <p role="alert">{error}</p>}

      {/* näytetään tiedot onnistuneen haun jälkeen */}
      {displayedMovie && (
        <div className="movie-header">

          {/* Juliste vasemmalla */}
          <div className="movie-details-poster">
            {posterUrl ? (
              <img
                src={posterUrl}
                alt={displayedMovie.title}
                width="500"
                height="750"
              />

            ) : (
              <p>Juliste puuttuu</p>
            )}
          </div>

          {/* Tiedot oikealla */}
          <div className="movie-meta">
            <h1>{displayedMovie.title}</h1>

            <p>
              Vuosi: {displayedMovie.release_date?.slice(0, 4) || "Ei tiedossa"}
            </p>

            <p>
              Arvosana: {displayedMovie.vote_average?.toFixed(1) ?? "Ei tiedossa"}
            </p>

            <h2>Kuvaus</h2>

            <p>
              {displayedMovie?.overview || "Kuvausta ei saatavilla"}
            </p>

            {fetchedMovie && (
              <>
                {/* Genret erotettu pilkuilla. */}
                <p>
                  Genret:{" "}
                  {fetchedMovie.genres?.length > 0
                    ? fetchedMovie.genres.map((genre) => genre.name).join(", ")
                    : "Ei tiedossa"}
                </p>
                {/* Elokuvan kesto minuutteina. */}
                <p>
                  Kesto:{" "}
                  {fetchedMovie.runtime > 0
                    ? `${fetchedMovie.runtime} min`
                    : "Ei tiedossa"}
                </p>
                {/* Näyttelijälistan ensimmäiset 5 nimeä. */}
                <h2>Näyttelijät</h2>
                <p>
                  {fetchedMovie.credits?.cast?.length > 0
                    ? fetchedMovie.credits.cast
                      .slice(0, 5)
                      .map((actor) => actor.name)
                      .join(", ")
                    : "Tietoja ei saatavilla"}
                </p>
              </>
            )}
          </div>

        </div>
      )}

      {displayedMovie && (
        <div className="reviews-container">

          <div className="review-section">
            <h2>Kirjoita arvostelu</h2>

            {user ? (
              <form onSubmit={handleReviewSubmit}>
                <label>Arvosana (0-10)</label>

                <input
                  type="number"
                  min="0"
                  max="10"
                  value={stars}
                  onChange={(e) => setStars(e.target.value)}
                />

                <label>Arvostelu</label>

                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                />
                <button type="submit">
                  Lähetä arvostelu
                </button>

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


          <div className="reviews-list">
            <h2>Käyttäjien arvostelut</h2>

            {reviews.length === 0 ? (
              <p>Ei arvosteluja vielä.</p>
            ) : (
              reviews.map((review) => (
                <div key={review.id} className="review-card">
                  <h3>{review.stars}/10</h3>

                  {editingReviewId === review.id ? (
                    <>
                      <textarea
                        className="edit-review-textarea"
                        value={editedText}
                        onChange={(e) => setEditedText(e.target.value)}
                      />

                      <input
                        className="edit-stars-input"
                        type="number"
                        min="0"
                        max="10"
                        value={editedStars}
                        onChange={(e) => setEditedStars(Number(e.target.value))}
                      />

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
                      <p>{review.text}</p>

                      <small>{review.nickname}</small>

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