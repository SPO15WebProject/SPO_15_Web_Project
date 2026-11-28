import { useState } from "react";
import { Link } from "react-router-dom";

// Muodostetaan linkki näyttelijähakuun.
function getActorSearchLink(actor) {
  const params = new URLSearchParams({
    query: actor.name,
    type: "actor"
  });

  return `/search?${params.toString()}`;
}

// Näytetään elokuvan näyttelijät.
function MovieCast({ movie }) {

  // Hallitaan näyttelijälistan laajentamista.
  const [showAllActors, setShowAllActors] = useState(false);

  // Kopioidaan näyttelijät ja järjestetään nimet A–Ö.
  const actors = [...(movie.credits?.cast ?? [])]
    .sort((a, b) => a.name.localeCompare(b.name, "fi"));

  // Näytetään aluksi 10 ensimmäistä näyttelijää.
  const visibleActors = showAllActors
    ? actors
    : actors.slice(0, 10);

  return (
    <section className="movie-detail-actors">

      <h2>Näyttelijät</h2>

      {actors.length > 0 ? (
        <>

          {/* Näyttelijät hakulinkkeinä */}
          <div className="movie-detail-links">
            {visibleActors.map(actor => (
              <Link
                key={actor.credit_id || actor.id}
                to={getActorSearchLink(actor)}
                className="movie-detail-search-link"
              >
                {actor.name}
              </Link>
            ))}
          </div>

          {/* Laajennuspainike, jos näyttelijöitä on yli 10 */}
          {actors.length > 10 && (
            <button
              type="button"
              className="movie-detail-actors-toggle"
              aria-expanded={showAllActors}
              onClick={() => setShowAllActors(previous => !previous)}
            >
              {showAllActors
                ? "Näytä vähemmän"
                : `Näytä kaikki näyttelijät (${actors.length})`}
            </button>
          )}

        </>
      ) : (
        <p>Tietoja ei saatavilla</p>
      )}

    </section>
  );
}

export default MovieCast;