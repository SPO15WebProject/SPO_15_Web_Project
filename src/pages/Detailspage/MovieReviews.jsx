import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function MovieReviews({ displayedMovie }) {

  const { user, clearUser } = useAuth();

  // Arvostelulomakkeen kentät ja käyttäjälle näytettävä palaute.
  const [stars, setStars] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [message, setMessage] = useState("");
  const [reviews, setReviews] = useState([]);

  // Muokattavan arvostelun ID ja lomakkeen väliaikaiset arvot.
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editedText, setEditedText] = useState("");
  const [editedStars, setEditedStars] = useState(0);

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
  );
}

export default MovieReviews;