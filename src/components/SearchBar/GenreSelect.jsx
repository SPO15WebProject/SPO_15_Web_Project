// Näytetään genret monivalintapainikkeina.
function GenreSelect({
  genres,
  selectedGenres,
  toggleGenre,
  clearGenres
}) {
  return (
    <div className="genre-picker" aria-label="Valitse genret">
      <div className="genre-picker-heading">
        <strong>Genret</strong>

        {selectedGenres.length > 0 && (
          <button
            type="button"
            className="genre-picker-clear"
            onClick={clearGenres}
          >
            Tyhjennä
          </button>
        )}
      </div>

      {/* IMDb-tyyliset monivalintapainikkeet. */}
      <div className="genre-chips">
        {genres.map(genre => {
          const selected = selectedGenres.includes(String(genre.id))

          return (
            <button
              key={genre.id}
              type="button"
              className={`genre-chip${selected ? ' is-selected' : ''}`}
              aria-pressed={selected}
              onClick={() => toggleGenre(genre.id)}
            >
              <span>{genre.name}</span>

              {selected && (
                <span className="genre-chip-remove" aria-hidden="true">
                  ×
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Valittujen genrejen lukumäärä. */}
      <div className="genre-picker-count">
        Valittu {selectedGenres.length} genreä
      </div>
    </div>
  )
}

export default GenreSelect