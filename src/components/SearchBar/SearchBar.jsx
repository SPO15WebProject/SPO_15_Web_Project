import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import './SearchBar.css'

function SearchBar() {
  // Onko hakupopup auki.
  const [isOpen, setIsOpen] = useState(false)

  // Käyttäjän kirjoittama hakuteksti.
  const [searchText, setSearchText] = useState('')

  // Hakutapa: movie = elokuva, actor = näyttelijä, genre = genre.
  const [searchType, setSearchType] = useState('movie')

  // TMDB:stä haetut genret ja käyttäjän valitsema genre.
  const [genres, setGenres] = useState([])
  const [selectedGenre, setSelectedGenre] = useState('')

  // Elokuvahaun automaattiset ehdotukset.
  const [suggestions, setSuggestions] = useState([])

  const navigate = useNavigate()

  // Viittaukset: koko hakukomponentti (ulkopuolisten klikkausten tunnistus)
  // ja tekstikenttä (fokus popupin avautuessa).
  const searchRef = useRef(null)
  const inputRef = useRef(null)

  // Siirretään fokus kenttään, kun popup aukeaa.
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

  // Suljetaan popup, kun klikataan sen ulkopuolelle tai painetaan Escape.
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

  // Vaihdetaan elokuva-, näyttelijä- ja genrehaun välillä.
  const handleSearchTypeChange = (event) => {
    setSearchType(event.target.value)
    setSearchText('')
    setSelectedGenre('')
    setSuggestions([])
  }

  // Siirrytään hakutulossivulle valitulla hakutavalla.
  const handleSearch = (event) => {
    event.preventDefault()

    const params = new URLSearchParams()

    if (searchType === 'genre') {
      if (!selectedGenre) return

      params.set('type', 'genre')
      params.set('genre', selectedGenre)

      // Genren nimi hakutulossivun otsikkoa varten.
      const genre = genres.find(
        genre => String(genre.id) === selectedGenre
      )

      if (genre) {
        params.set('query', genre.name)
      }
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

  // Tiivistetyn kentän teksti: näyttää viimeisimmän hakusanan, jos sellainen on.
  const triggerLabel = searchText.trim() || 'Hae...'

  return (
    <div ref={searchRef} className="search-bar">

      {/* Suljettu tila: pieni hakukenttä, joka avaa popupin. */}
      <button
        type="button"
        className="search-trigger"
        onClick={() => setIsOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label="Avaa haku"
      >
        <svg
          viewBox="0 0 24 24"
          width="16"
          height="16"
          aria-hidden="true"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3.5-3.5" />
        </svg>
        <span>{triggerLabel}</span>
      </button>

      {/* Avoin tila: hakutavan valinta, kenttä, painike ja ehdotukset. */}
      {isOpen && (
        <div
          className="search-popup"
          role="dialog"
          aria-label="Haku"
        >
          <form onSubmit={handleSearch} className="search-form">

            <select
              value={searchType}
              onChange={handleSearchTypeChange}
              aria-label="Valitse hakutapa"
              className="search-type-select"
            >
              <option value="movie">Elokuva</option>
              <option value="actor">Näyttelijä</option>
              <option value="genre">Genre</option>
            </select>

            {/* Genrehaussa genrevalikko, muuten hakutekstikenttä. */}
            {searchType === 'genre' ? (
              <select
                value={selectedGenre}
                onChange={(event) => setSelectedGenre(event.target.value)}
                aria-label="Valitse genre"
                className="genre-select"
                required
              >
                <option value="">Valitse genre</option>

                {genres.map((genre) => (
                  <option key={genre.id} value={genre.id}>
                    {genre.name}
                  </option>
                ))}
              </select>
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

          {/* Elokuvahaun automaattiset ehdotukset julisteineen. */}
          {searchType === 'movie' && suggestions.length > 0 && (
            <ul className="search-suggestions">
              {suggestions.map((movie) => (
                <li key={movie.id}>
                  <button
                    type="button"
                    className="search-suggestion"
                    onClick={() => handleSuggestionClick(movie)}
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
          )}
        </div>
      )}
    </div>
  )
}

export default SearchBar