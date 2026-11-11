import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { NavLink, useNavigate } from 'react-router-dom'

function Navbar() {
  // Käyttäjän kirjoittama hakuteksti.
  const [searchText, setSearchText] = useState('')

  // Hakutapa: movie = elokuva, actor = näyttelijä.
  const [searchType, setSearchType] = useState('movie')

  // Elokuvahaun automaattiset ehdotukset.
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  const navigate = useNavigate()

  // Viittaus hakulomakkeeseen ulkopuolisten klikkausten tunnistamista varten.
  const searchRef = useRef(null)

  // Säilytetään nykyiset kirjautumistoiminnot.
  const user = JSON.parse(localStorage.getItem('user'))

  const logout = () => {
    localStorage.removeItem('user')
    window.location.reload()
  }

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

    // Näyttelijätilassa ei käytetä elokuvien nimiehdotuksia.
    if (searchType !== 'movie' || query.length < 2) {
      setSuggestions([])
      return
    }

    // Mahdollistaa vanhan API-pyynnön peruuttamisen.
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

    // Peruutetaan ajastin ja vanha pyyntö,
    // jos käyttäjä jatkaa kirjoittamista.
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [searchText, searchType])

  // Vaihdetaan elokuvahaun ja näyttelijähaun välillä.
  const handleSearchTypeChange = (event) => {
    setSearchType(event.target.value)
    setSearchText('')
    setSuggestions([])
    setShowSuggestions(false)
  }

  // Siirrytään hakutulossivulle käyttäjän antamalla hakusanalla.
  const handleSearch = (event) => {
    event.preventDefault()

    const query = searchText.trim()

    if (!query) return

    setShowSuggestions(false)

    const params = new URLSearchParams()
    params.set('query', query)

    if (searchType === 'actor') {
      params.set('type', 'actor')
    }

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
    <nav className="navbar">
      <NavLink to="/" end>Etusivu</NavLink>
      <NavLink to="/trending">Trendaavat</NavLink>
      <NavLink to="/popular">Suositut</NavLink>

      {/* Hakulomake */}
      <form
        ref={searchRef}
        onSubmit={handleSearch}
        className="navbar-search"
        style={{
          transform: 'translateY(-10px)',
          position: 'relative'
        }}
      >
        {/* Valitaan, haetaanko elokuvaa vai näyttelijää. */}
        <select
          value={searchType}
          onChange={handleSearchTypeChange}
          aria-label="Valitse hakutapa"
          className="search-type-select"
        >
          <option value="movie">Elokuva</option>
          <option value="actor">Näyttelijä</option>
        </select>

        {/* Hakuteksti */}
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

      {/* Kirjautumistoiminnot */}
      {user ? (
        <>
          <span>Tervetuloa, {user.nickname}</span>

          <button onClick={logout}>
            Kirjaudu ulos
          </button>
        </>
      ) : (
        <>
          <NavLink to="/login">
            Kirjaudu sisään
          </NavLink>

          <NavLink to="/register">
            Rekisteröidy
          </NavLink>
        </>
      )}
    </nav>
  )
}

export default Navbar