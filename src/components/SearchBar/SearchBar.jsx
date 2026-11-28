import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import './SearchBar.css'
import MovieOrigin from '../MovieFilters/MovieOrigin'
import Icon from '../Icon/Icon'
import GenreSelect from './GenreSelect'
import SearchSuggestions from './SearchSuggestions'

function SearchBar() {
  // Onko hakukenttä laajennettu.
  const [isOpen, setIsOpen] = useState(false)

  // Käyttäjän kirjoittama hakuteksti.
  const [searchText, setSearchText] = useState('')
  const [origin, setOrigin] = useState('')

  // Hakutapa: elokuva, näyttelijä, genre, maa tai kieli.
  const [searchType, setSearchType] = useState('movie')
  const isOriginSearch = searchType === 'country' || searchType === 'language'

  // TMDB:stä haetut genret ja käyttäjän valitsemat genret.
  const [genres, setGenres] = useState([])
  const [selectedGenres, setSelectedGenres] = useState([])

  // Elokuvahaun automaattiset ehdotukset.
  const [suggestions, setSuggestions] = useState([])

  const navigate = useNavigate()

  // Viittaukset hakukomponenttiin ja tekstikenttään.
  const searchRef = useRef(null)
  const inputRef = useRef(null)

  // Siirretään fokus kenttään, kun haku laajenee.
  useEffect(() => {
    if (!isOpen) return

    if (searchType === 'genre') return

    inputRef.current?.focus()
  }, [isOpen, searchType])

  // Haetaan genrelista, kun käyttäjä valitsee genrehaun.
  useEffect(() => {
    if (searchType !== 'genre') return

    const controller = new AbortController()

    const fetchGenres = async () => {
      try {
        const response = await axios.get('/movies/genres', {
          signal: controller.signal
        })

        if (!controller.signal.aborted) {
          setGenres(Array.isArray(response.data) ? response.data : [])
        }
      } catch (error) {
        if (!axios.isCancel(error) && !controller.signal.aborted) {
          console.error('Genrejen lataus epäonnistui:', error)
        }
      }
    }

    fetchGenres()

    return () => controller.abort()
  }, [searchType])

  // Suljetaan haku ulkopuolisesta klikkauksesta tai Escapesta.
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (event) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target)
      ) {
        setIsOpen(false)
      }
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  // Haetaan automaattisia ehdotuksia vain elokuvahaussa.
  useEffect(() => {
    const query = searchText.trim()

    if (searchType !== 'movie' || query.length < 2) {
      setSuggestions([])
      return
    }

    const controller = new AbortController()

    // Odotetaan hetki ennen API-kutsua.
    const timer = setTimeout(async () => {
      try {
        const response = await axios.get(
          `/movies/search?query=${encodeURIComponent(query)}`,
          { signal: controller.signal }
        )

        if (!controller.signal.aborted) {
          setSuggestions(
            Array.isArray(response.data.results)
              ? response.data.results.slice(0, 5)
              : []
          )
        }
      } catch (error) {
        if (!axios.isCancel(error) && !controller.signal.aborted) {
          console.error('Hakuehdotusten lataus epäonnistui:', error)
          setSuggestions([])
        }
      }
    }, 150)

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [searchText, searchType])

  // Vaihdetaan hakutapaa ja tyhjennetään aikaisemmat valinnat.
  const handleSearchTypeChange = (event) => {
    setSearchType(event.target.value)
    setSearchText('')
    setOrigin('')
    setSelectedGenres([])
    setSuggestions([])
  }

  // Valitut genret nimillä.
  const selectedGenreNames = selectedGenres
    .map(id => genres.find(genre => String(genre.id) === id)?.name)
    .filter(Boolean)

  // Siirrytään hakutulossivulle valitulla hakutavalla.
  const handleSearch = (event) => {
    event.preventDefault()

    const params = new URLSearchParams()

    if (isOriginSearch) {
      if (!origin) return

      params.set('type', searchType)
      params.set(searchType, origin)

    } else if (searchType === 'genre') {
      if (selectedGenres.length === 0) return

      params.set('type', 'genre')
      params.set('genre', selectedGenres.join(','))
      params.set('query', selectedGenreNames.join(' + '))

    } else {
      const query = searchText.trim()

      if (!query) return

      params.set('query', query)

      if (searchType === 'actor') {
        params.set('type', 'actor')
      }
    }

    setIsOpen(false)
    navigate(`/search?${params.toString()}`)
  }

  // Avataan elokuva hakuehdotuksesta.
  const handleSuggestionClick = (movie) => {
    setIsOpen(false)
    setSearchText('')
    setSuggestions([])

    navigate(`/movies/${movie.id}`, {
      state: { movie }
    })
  }

  // Lisätään tai poistetaan genre valinnoista.
  const toggleGenre = (id) => {
    const value = String(id)

    setSelectedGenres(previous => previous.includes(value)
      ? previous.filter(selected => selected !== value)
      : [...previous, value])
  }

  // Tyhjennetään kaikki genrevalinnat.
  const clearGenres = () => {
    setSelectedGenres([])
  }

  // Näytetäänkö laajennuksen alla pudotuspaneeli.
  const showGenrePicker = searchType === 'genre'
  const showSuggestions = searchType === 'movie' && suggestions.length > 0

  return (
    <div
      ref={searchRef}
      className={`search-bar${isOpen ? ' is-open' : ''}`}
    >
      <div className="search-shell">

        {/* Suljettu tila: pelkkä kuvake ja Hae-teksti. */}
        {!isOpen && (
          <button
            type="button"
            className="search-trigger"
            onClick={() => setIsOpen(true)}
            aria-label="Avaa haku"
          >
            <Icon name="search" size={16} strokeWidth={2} />
            <span>Hae</span>
          </button>
        )}

        {/* Laajennettu tila: hakutapa, kenttä ja Hae-painike. */}
        {isOpen && (
          <form onSubmit={handleSearch} className="search-form" role="search">
            <Icon
              name="search"
              size={16}
              strokeWidth={2}
              className="search-form-icon"
            />

            {/* Hakutavan valitseminen. */}
            <select
              value={searchType}
              onChange={handleSearchTypeChange}
              aria-label="Valitse hakutapa"
              className="search-type-select"
            >
              <option value="movie">Elokuva</option>
              <option value="actor">Näyttelijä</option>
              <option value="genre">Genre</option>
              <option value="country">Maa</option>
              <option value="language">Kieli</option>
            </select>

            {/* Näytetään valitun hakutavan mukainen kenttä. */}
            {isOriginSearch ? (
              <MovieOrigin
                key={searchType}
                kind={searchType}
                value={origin}
                onChange={setOrigin}
                emptyLabel="Valitse"
              />
            ) : searchType === 'genre' ? (
              <div className="genre-selection-summary" aria-live="polite">
                {selectedGenreNames.length > 0
                  ? selectedGenreNames.join(', ')
                  : 'Valitse genret alta'}
              </div>
            ) : (
              <input
                ref={inputRef}
                type="search"
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                placeholder={
                  searchType === 'actor'
                    ? 'Hae näyttelijää...'
                    : 'Hae elokuvia...'
                }
                aria-label={
                  searchType === 'actor'
                    ? 'Hae näyttelijän nimellä'
                    : 'Hae elokuvan nimellä'
                }
                autoComplete="off"
              />
            )}

            <button type="submit" className="search-submit">
              Hae
            </button>
          </form>
        )}
      </div>

      {/* Pudotuspaneeli laajennetun hakukentän alla. */}
      {isOpen && (showGenrePicker || showSuggestions) && (
        <div className="search-dropdown">

          {/* Genrevalikko omana komponenttinaan. */}
          {showGenrePicker && (
            <GenreSelect
              genres={genres}
              selectedGenres={selectedGenres}
              toggleGenre={toggleGenre}
              clearGenres={clearGenres}
            />
          )}

          {/* Automaattiset hakuehdotukset omana komponenttinaan. */}
          {showSuggestions && (
            <SearchSuggestions
              suggestions={suggestions}
              onSelect={handleSuggestionClick}
            />
          )}

        </div>
      )}
    </div>
  )
}

export default SearchBar