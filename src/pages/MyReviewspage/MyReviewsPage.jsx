import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./MyReviewsPage.css";

//Päivämäärä
function formatDate(dateValue) {
  if (!dateValue) return "";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("fi-FI");
}

function MyReviewsPage() {
  //Haetaan kirjautunut käyttäjä (user.userid) ja auth-lataustila
  const { user, loading: authLoading } = useAuth();
  const userId = user?.userid ?? null;

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editedText, setEditedText] = useState("");
  const [editedStars, setEditedStars] = useState(0);

  //Haetaan käyttäjän arvostelut
  useEffect(() => {
    const fetchMyReviews = async () => {
      if (authLoading) {
        return;
      }

      //Jos käyttäjä ei ole kirjautunut, tyhjennetään lista eikä tehdä pyyntöä
      if (!userId) {
        setReviews([]);
        setError("");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      //credentials: include lähettää JWT-evästeen mukana backendille
      try {
        const response = await fetch(`/api/db/GetReviewsByUser/${userId}`, {
          credentials: "include",
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Arvostelujen haku epäonnistui.");
        }


        setReviews(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || "Virhe arvostelujen haussa.");
      } finally {
        setLoading(false);
      }
    };

    fetchMyReviews();
  }, [userId, authLoading]);

  //Arvostelun poistaminen
  const handleDelete = async (reviewId) => {
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
  const handleEdit = (review) => {
    setEditingReviewId(review.id);
    setEditedText(review.text || "");
    setEditedStars(review.stars);
  };

  const handleSaveEdit = async (reviewId) => {
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

  const isPageLoading = authLoading || loading;

  return (
    <div className="my-reviews-page">
      <div className="my-reviews-card">
        <h2>Omat arvostelut</h2>


        {error && <p className="my-reviews-error">{error}</p>}


        {isPageLoading ? (
          <p>Ladataan arvosteluja...</p>
        ) : !user ? (
          <p>
            <Link to="/Login">Kirjaudu sisään nähdäksesi omat arvostelusi.</Link>
          </p>
        ) : reviews.length === 0 ? (
          <p>Et ole vielä kirjoittanut arvosteluja.</p>
        ) : (
          <div className="my-reviews-list">
            {reviews.map((review) => {

              const movieId = review.movieId ?? review.movieid;
              const created = review.createdAt ?? review.createdat;
              const dateText = formatDate(created);

              return (
                <div key={review.id} className="my-review-item">
                  <div className="my-review-header">
                    <div>
                      <h3>
                        <Link to={`/movies/${movieId}`}>Elokuva #{movieId}</Link>
                      </h3>
                      {dateText && <span className="my-review-date">{dateText}</span>}
                    </div>
                    <span className="my-review-stars">{review.stars} / 10</span>
                  </div>

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
                          onClick={() => handleSaveEdit(review.id)}
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
                      <p className="my-review-text">
                        {review.text || "Ei arvostelutekstiä."}
                      </p>

                      <div className="review-action-buttons">
                        <button
                          className="edit-review-btn"
                          onClick={() => handleEdit(review)}
                        >
                          Muokkaa
                        </button>

                        <button
                          className="delete-review-btn"
                          onClick={() => handleDelete(review.id)}
                        >
                          Poista arvostelu
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyReviewsPage;