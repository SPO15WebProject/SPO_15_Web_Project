import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

function SearchBar() {
  // Käyttäjän kirjoittama hakuteksti.
  const [searchText, setSearchText] = useState('')

  // Hakutapa: movie = elokuva, actor = näyttelijä, genre = genre.
  const [searchType, setSearchType] = useState('movie')

  // TMDB:stä haetut genret ja käyttäjän valitsema genre.
  const [genres, setGenres] = useState([])
  const [selectedGenre, setSelectedGenre] = useState('')

  // Elokuvahaun automaattiset ehdotukset.
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  const navigate = useNavigate()

  // Viittaus hakulomakkeeseen ulkopuolisten klikkausten tunnistamista varten.
  const searchRef = useRef(null)

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
          setGenres(
            Array.isArray(response.data)
              ? response.data
              : []
          )
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error('Genrejen lataus epäonnistui:', error)
        }
      }
    }

    fetchGenres()

    return () => controller.abort()
  }, [searchType])

  // Suljetaan ehdotukset, kun klikataan hakulomakkeen ulkopuolelle.
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Haetaan automaattisia ehdotuksia vain elokuvahaussa.
  useEffect(() => {
    const query = searchText.trim()

    // Näyttelijä- ja genrehaussa ei käytetä elokuvien nimiehdotuksia.
    if (searchType !== 'movie' || query.length < 2) {
      setSuggestions([])
      return
    }

    // Mahdollistaa API-pyynnön peruuttamisen.
    const controller = new AbortController()

    // Odotetaan hetki ennen API-kutsua.
    const timer = setTimeout(async () => {
      try {
        const response = await axios.get(
          `/movies/search?query=${encodeURIComponent(query)}`,
          { signal: controller.signal }
        )

        if (!controller.signal.aborted) {
          // Hakutulokset löytyvät results-kentästä.
          setSuggestions(
            Array.isArray(response.data.results)
              ? response.data.results.slice(0, 5)
              : []
          )
        }
      } catch (error) {
        if (!axios.isCancel(error) && !controller.signal.aborted) {
          console.error(
            'Hakuehdotusten lataus epäonnistui:',
            error
          )
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
    setShowSuggestions(false)
  }

  // Siirrytään hakutulossivulle valitulla hakutavalla.
  const handleSearch = (event) => {
    event.preventDefault()

    const params = new URLSearchParams()

    // Genrehaussa käytetään valitun genren tunnistetta.
    if (searchType === 'genre') {
      if (!selectedGenre) return

      params.set('type', 'genre')
      params.set('genre', selectedGenre)

      // Lisätään genren nimi hakutulossivun otsikkoa varten.
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

    setShowSuggestions(false)

    navigate(`/search?${params.toString()}`)
  }

  // Avataan elokuva hakuehdotuksesta.
  const handleSuggestionClick = (movie) => {
    setShowSuggestions(false)
    setSearchText(movie.title)

    navigate(`/movies/${movie.id}`, {
      state: { movie }
    })
  }

  return (
    /* Hakulomake */
    <form
      ref={searchRef}
      onSubmit={handleSearch}
      className="navbar-search"
      style={{
        transform: 'translateY(-10px)',
        position: 'relative'
      }}
    >
      {/* Valitaan elokuva-, näyttelijä- tai genrehaku. */}
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

      {/* Genrehaussa näytetään genrevalikko, muuten hakutekstikenttä. */}
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
          type="search"
          value={searchText}
          onChange={(event) => {
            setSearchText(event.target.value)
            setShowSuggestions(true)
          }}
          onFocus={() => setShowSuggestions(true)}
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

      <button type="submit">Hae</button>

      {/* Elokuvahaun automaattiset ehdotukset */}
      {searchType === 'movie' &&
        showSuggestions &&
        suggestions.length > 0 && (
          <div className="search-suggestions">
            {suggestions.map((movie) => (
              <button
                key={movie.id}
                type="button"
                className="search-suggestion"
                onClick={() => handleSuggestionClick(movie)}
              >
                {/* Elokuvan pieni juliste */}
                {movie.poster_path && (
                  <img
                    src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                    alt=""
                  />
                )}

                {/* Elokuvan nimi ja julkaisuvuosi */}
                <span>
                  {movie.title}

                  {movie.release_date && (
                    <small>
                      {' '}({movie.release_date.slice(0, 4)})
                    </small>
                  )}
                </span>
              </button>
            ))}
          </div>
        )}
    </form>
  )
}

export default SearchBar