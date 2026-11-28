import { Link } from "react-router-dom";

// Maiden ja kielten suomenkieliset nimet.
const countryNames = new Intl.DisplayNames(["fi"], {
  type: "region"
});

const languageNames = new Intl.DisplayNames(["fi"], {
  type: "language"
});

// Muodostetaan linkki genrehakuun.
function getGenreSearchLink(genre) {
  const params = new URLSearchParams({
    type: "genre",
    genre: String(genre.id),
    query: genre.name
  });

  return `/search?${params.toString()}`;
}

// Muodostetaan linkki maa- tai kielihakuun.
function originLink(type, code) {
  const params = new URLSearchParams({
    type,
    [type]: code
  });

  return `/search?${params.toString()}`;
}

// Näytetään elokuvan juliste ja perustiedot.
function MovieInformation({ displayedMovie, fetchedMovie }) {

  // Muodostetaan julisteen osoite.
  const posterUrl = displayedMovie.poster_path
    ? `https://image.tmdb.org/t/p/w500${displayedMovie.poster_path}`
    : null;

  return (
    <div className="movie-header">

      {/* Elokuvan juliste */}
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

      {/* Elokuvan perustiedot */}
      <div className="movie-meta">

        <h1>{displayedMovie.title}</h1>

        <p>
          Vuosi: {displayedMovie.release_date?.slice(0, 4) || "Ei tiedossa"}
        </p>

        <p>
          Arvosana: {displayedMovie.vote_average?.toFixed(1) ?? "Ei tiedossa"}
        </p>

        {/* Tarkemmat tiedot näytetään latauksen jälkeen. */}
        {fetchedMovie && (
          <>

            {/* Genret hakulinkkeinä */}
            <div className="movie-detail-genres">
              <strong>Genret</strong>

              <div className="movie-detail-links">
                {fetchedMovie.genres?.length > 0
                  ? fetchedMovie.genres.map(genre => (
                    <Link
                      key={genre.id}
                      to={getGenreSearchLink(genre)}
                      className="movie-detail-search-link"
                    >
                      {genre.name}
                    </Link>
                  ))
                  : <span>Ei tiedossa</span>
                }
              </div>
            </div>

            {/* Alkuperämaat hakulinkkeinä */}
            <div className="movie-detail-genres">
              <strong>Alkuperämaa</strong>

              <div className="movie-detail-links">
                {(fetchedMovie.origin_country || [])
                  .filter(code => /^[A-Z]{2}$/.test(code))
                  .map(code => (
                    <Link
                      key={code}
                      to={originLink("country", code)}
                      className="movie-detail-search-link"
                    >
                      {countryNames.of(code)}
                    </Link>
                  ))
                }

                {!fetchedMovie.origin_country?.length && (
                  <span>Ei tiedossa</span>
                )}
              </div>
            </div>

            {/* Alkuperäinen kieli hakulinkkinä */}
            <div className="movie-detail-genres">
              <strong>Alkuperäinen kieli</strong>

              <div className="movie-detail-links">
                {/^[a-z]{2}$/.test(fetchedMovie.original_language || "")
                  ? (
                    <Link
                      to={originLink(
                        "language",
                        fetchedMovie.original_language
                      )}
                      className="movie-detail-search-link"
                    >
                      {languageNames.of(fetchedMovie.original_language)}
                    </Link>
                  )
                  : <span>Ei tiedossa</span>
                }
              </div>
            </div>

            {/* Elokuvan kesto */}
            <p>
              Kesto: {fetchedMovie.runtime > 0
                ? `${fetchedMovie.runtime} min`
                : "Ei tiedossa"}
            </p>

          </>
        )}

        {/* Elokuvan kuvaus */}
        <h2>Kuvaus</h2>

        <p>
          {displayedMovie.overview || "Kuvausta ei saatavilla"}
        </p>

      </div>
    </div>
  );
}

export default MovieInformation;