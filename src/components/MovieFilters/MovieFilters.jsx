import { useEffect, useState } from 'react'
import axios from 'axios'
import useMovieBrowse from '../../hooks/useMovieBrowse'
import MovieOrigin from './MovieOrigin'
import GenreSelect from '../SearchBar/GenreSelect'
import './MovieFilters.css'

function MovieFilters({
  title,
  filters,
  setFilters,
  baseCountry = '',
  baseLanguage = ''
}) {

  // Säilytetään suodatusvalikon näkyvyys selaustilassa.
  const [isOpen, setIsOpen] = useMovieBrowse('filtersOpen', false)

  // TMDB:stä haettavat genret.
  const [genres, setGenres] = useState([])
  const [genresLoading, setGenresLoading] = useState(false)
  const [genresError, setGenresError] = useState(null)

  // Luetaan suodattimien nykyiset arvot.
  const {
    year,
    rating,
    sortBy,
    country,
    language,
    genres: selectedGenres = []
  } = filters

  // Haetaan genrelista, kun suodatusvalikko avataan.
  useEffect(() => {
    if (!isOpen) return

    const controller = new AbortController()

    const fetchGenres = async () => {
      setGenresLoading(true)
      setGenresError(null)

      try {
        const response = await axios.get('/movies/genres', {
          signal: controller.signal
        })

        if (!controller.signal.aborted) {
          setGenres(
            Array.isArray(response.data) ? response.data : []
          )
        }

      } catch (error) {
        if (!axios.isCancel(error) && !controller.signal.aborted) {
          console.error('Genrejen lataus epäonnistui:', error)
          setGenresError('Genrejen lataus epäonnistui.')
        }

      } finally {
        if (!controller.signal.aborted) {
          setGenresLoading(false)
        }
      }
    }

    fetchGenres()

    return () => controller.abort()

  }, [isOpen])

  // Päivitetään yksittäinen suodatin.
  const updateFilter = (name, value) => {
    setFilters(previous => ({
      ...previous,
      [name]: value
    }))
  }

  // Lisätään tai poistetaan genre valinnoista.
  const toggleGenre = (id) => {
    const value = String(id)

    setFilters(previous => {
      const currentGenres = previous.genres || []

      return {
        ...previous,
        genres: currentGenres.includes(value)
          ? currentGenres.filter(selected => selected !== value)
          : [...currentGenres, value]
      }
    })
  }

  // Tyhjennetään vain genrevalinnat.
  const clearGenres = () => {
    updateFilter('genres', [])
  }

  // Palautetaan kaikki suodattimet alkuperäiseen tilaan.
  const resetFilters = () => {
    setFilters({
      year: '',
      rating: '',
      sortBy: '',
      country: baseCountry,
      language: baseLanguage,
      genres: []
    })
  }

  return (
    <div className="movie-filters-container">

      {/* Hakutulosten otsikko ja suodatuspainike. */}
      <div className="movie-filters-header">

        <h2 className="search-results-title">{title}</h2>

        <button
          type="button"
          className="filter-toggle-button"
          aria-expanded={isOpen}
          onClick={() => setIsOpen(previous => !previous)}
        >

          {/* Suodatuskuvake. */}
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

          {/* Valikon suunnan osoittava nuoli. */}
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

      {/* Näytetään suodattimet valikon ollessa auki. */}
      {isOpen && (
        <div className="movie-filters">

          <h2>Suodata elokuvia</h2>

          {/* Julkaisuvuosi. */}
          <div className="filter-group">
            <label htmlFor="filter-year">Julkaisuvuosi</label>

            <input
              id="filter-year"
              type="number"
              placeholder="Esim. 2020"
              min="1900"
              value={year}
              onChange={event =>
                updateFilter('year', event.target.value)
              }
            />
          </div>

          {/* Vähimmäisarvosana. */}
          <div className="filter-group">
            <label htmlFor="filter-rating">Arvosana</label>

            <select
              id="filter-rating"
              value={rating}
              onChange={event =>
                updateFilter('rating', event.target.value)
              }
            >
              <option value="">Kaikki arvosanat</option>
              <option value="5">Vähintään 5/10</option>
              <option value="6">Vähintään 6/10</option>
              <option value="7">Vähintään 7/10</option>
              <option value="8">Vähintään 8/10</option>
              <option value="9">Vähintään 9/10</option>
            </select>
          </div>

          {/* Alkuperämaa. */}
          <div className="filter-group">
            <label htmlFor="filter-country">Alkuperämaa</label>

            <MovieOrigin
              kind="country"
              id="filter-country"
              value={country || ''}
              onChange={value =>
                updateFilter('country', value || baseCountry)
              }
              emptyLabel="Kaikki maat"
            />
          </div>

          {/* Alkuperäinen kieli. */}
          <div className="filter-group">
            <label htmlFor="filter-language">
              Alkuperäinen kieli
            </label>

            <MovieOrigin
              kind="language"
              id="filter-language"
              value={language || ''}
              onChange={value =>
                updateFilter('language', value || baseLanguage)
              }
              emptyLabel="Kaikki kielet"
            />
          </div>

          {/* Elokuvien järjestys. */}
          <div className="filter-group">
            <label htmlFor="filter-sort">Järjestys</label>

            <select
              id="filter-sort"
              value={sortBy}
              onChange={event =>
                updateFilter('sortBy', event.target.value)
              }
            >
              <option value="">Oletusjärjestys</option>
              <option value="popularity.desc">Suosituimmat</option>
              <option value="vote_average.desc">
                Parhaat arvosanat
              </option>
              <option value="primary_release_date.desc">
                Uusimmat
              </option>
              <option value="primary_release_date.asc">
                Vanhimmat
              </option>
            </select>
          </div>

          {/* Kaikkien suodattimien tyhjentäminen. */}
          <button type="button" onClick={resetFilters}>
            Tyhjennä suodattimet
          </button>

          {/* Käytetään samaa genrevalikkoa kuin hakukentässä. */}
          <div className="filter-genres">

            {genresLoading && (
              <p>Ladataan genrejä...</p>
            )}

            {genresError && (
              <p role="alert">{genresError}</p>
            )}

            {!genresLoading && !genresError && (
              <GenreSelect
                genres={genres}
                selectedGenres={selectedGenres}
                toggleGenre={toggleGenre}
                clearGenres={clearGenres}
              />
            )}

          </div>

        </div>
      )}

    </div>
  )
}

export default MovieFilters