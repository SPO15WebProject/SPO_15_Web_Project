import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./MyReviewsPage.css";

// Muotoillaan päivämäärä suomalaiseen muotoon
function formatDate(dateValue) {
  if (!dateValue) return "";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("fi-FI");
}

function MyReviewsPage() {
  // Haetaan kirjautunut käyttäjä (user.userid) ja auth-lataustila AuthContextista
  const { user, loading: authLoading } = useAuth();
  const userId = user?.userid ?? null;

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Haetaan käyttäjän arvostelut
  useEffect(() => {
    const fetchMyReviews = async () => {
      // Odotetaan, että AuthContext on tarkistanut kirjautumistilan
      if (authLoading) {
        return;
      }

      // Jos käyttäjä ei ole kirjautunut, tyhjennetään lista eikä tehdä pyyntöä
      if (!userId) {
        setReviews([]);
        setError("");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      // credentials: "include" lähettää JWT-evästeen mukana backendille
      try {
        const response = await fetch(`/api/db/GetReviewsByUser/${userId}`, {
          credentials: "include",
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Arvostelujen haku epäonnistui.");
        }

        // Tallennetaan haetut arvostelut tilaan
        setReviews(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || "Virhe arvostelujen haussa.");
      } finally {
        setLoading(false);
      }
    };

    fetchMyReviews();
  }, [userId, authLoading]);

  const isPageLoading = authLoading || loading;

  return (
    <div className="my-reviews-page">
      <div className="my-reviews-card">
        <h2>Omat arvostelut</h2>

        {/* Näytetään virheviesti, jos sellainen on */}
        {error && <p className="my-reviews-error">{error}</p>}

        {/* Näytetään eri tilat selkeästi: lataus -> kirjautumaton -> tyhjä -> arvostelut */}
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
              // Tuetut kenttänimet sekä camelCase- että lowercase-muodossa
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

                  <p className="my-review-text">
                    {review.text || "Ei arvostelutekstiä."}
                  </p>
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