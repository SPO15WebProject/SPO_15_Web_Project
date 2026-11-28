// Näytetään elokuvahaun automaattiset ehdotukset.
function SearchSuggestions({ suggestions, onSelect }) {
  return (
    <ul className="search-suggestions">
      {suggestions.map((movie) => (
        <li key={movie.id}>
          <button
            type="button"
            className="search-suggestion"
            onClick={() => onSelect(movie)}
          >
            {/* Juliste tai samankokoinen placeholder. */}
            {movie.poster_path ? (
              <img
                src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                srcSet={`https://image.tmdb.org/t/p/w92${movie.poster_path} 1x, https://image.tmdb.org/t/p/w185${movie.poster_path} 2x`}
                alt=""
                width="46"
                height="69"
                loading="lazy"
              />
            ) : (
              <span
                className="search-suggestion-placeholder"
                aria-hidden="true"
              >
                ?
              </span>
            )}

            {/* Nimi, vuosi ja arvosana. */}
            <span className="search-suggestion-text">
              <strong>{movie.title}</strong>

              <small>
                {movie.release_date?.slice(0, 4) || 'Ei tiedossa'}
                {typeof movie.vote_average === 'number' &&
                  movie.vote_average > 0 &&
                  ` • ★ ${movie.vote_average.toFixed(1)}`}
              </small>
            </span>
          </button>
        </li>
      ))}
    </ul>
  )
}

export default SearchSuggestions