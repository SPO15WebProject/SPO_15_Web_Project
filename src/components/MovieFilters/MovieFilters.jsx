import { useState } from 'react'
import './MovieFilters.css'

function MovieFilters({ title, filters, setFilters }) {

  // Hallitaan suodatusvalikon näkyvyyttä.
  const [isOpen, setIsOpen] = useState(false)

  // Luetaan suodattimien nykyiset arvot.
  const { year, rating, sortBy } = filters

  // Päivitetään yksittäinen suodatin.
  const updateFilter = (name, value) => {
    setFilters((previous) => ({
      ...previous,
      [name]: value
    }))
  }

  // Palautetaan suodattimet alkuperäiseen tilaan.
  const resetFilters = () => {
    setFilters({
      year: '',
      rating: '',
      sortBy: ''
    })
  }

  return (
    <div className="movie-filters-container">

      {/* Hakutulosten otsikko ja suodatuspainike */}
      <div className="movie-filters-header">

        <h2 className="search-results-title">{title}</h2>

        {/* Suodatusvalikon avaaminen ja sulkeminen */}
        <button
          type="button"
          className="filter-toggle-button"
          aria-expanded={isOpen}
          onClick={() => setIsOpen(previous => !previous)}
        >

          {/* Suodatuskuvake */}
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
            <circle cx="8" cy="6" r="2" fill="currentColor" />
            <circle cx="16" cy="12" r="2" fill="currentColor" />
            <circle cx="10" cy="18" r="2" fill="currentColor" />
          </svg>

          Suodattimet

          {/* Valikon suunnan osoittava nuoli */}
          <svg
            className={`filter-arrow ${isOpen ? 'open' : ''}`}
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>

        </button>

      </div>

      {/* Näytetään suodattimet vain valikon ollessa auki */}
      {isOpen && (
        <div className="movie-filters">

          <h2>Suodata elokuvia</h2>

          {/* Julkaisuvuosi */}
          <div className="filter-group">
            <label htmlFor="filter-year">Julkaisuvuosi</label>

            <input
              id="filter-year"
              type="number"
              placeholder="Esim. 2020"
              min="1900"
              value={year}
              onChange={(e) => updateFilter('year', e.target.value)}
            />
          </div>

          {/* Vähimmäisarvosana */}
          <div className="filter-group">
            <label htmlFor="filter-rating">Arvosana</label>

            <select
              id="filter-rating"
              value={rating}
              onChange={(e) => updateFilter('rating', e.target.value)}
            >
              <option value="">Kaikki arvosanat</option>
              <option value="5">Vähintään 5/10</option>
              <option value="6">Vähintään 6/10</option>
              <option value="7">Vähintään 7/10</option>
              <option value="8">Vähintään 8/10</option>
              <option value="9">Vähintään 9/10</option>
            </select>
          </div>

          {/* Elokuvien järjestys */}
          <div className="filter-group">
            <label htmlFor="filter-sort">Järjestys</label>

            <select
              id="filter-sort"
              value={sortBy}
              onChange={(e) => updateFilter('sortBy', e.target.value)}
            >
              <option value="">Oletusjärjestys</option>
              <option value="popularity.desc">Suosituimmat</option>
              <option value="vote_average.desc">Parhaat arvosanat</option>
              <option value="primary_release_date.desc">Uusimmat</option>
              <option value="primary_release_date.asc">Vanhimmat</option>
            </select>
          </div>

          {/* Suodattimien tyhjentäminen */}
          <button type="button" onClick={resetFilters}>
            Tyhjennä suodattimet
          </button>

        </div>
      )}

    </div>
  )
}

export default MovieFilters