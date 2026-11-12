import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { NavLink, useNavigate } from 'react-router-dom'

function Navbar() {
  // Tallennetaan käyttäjän hakukenttään kirjoittama teksti.
  const [searchText, setSearchText] = useState('')

  // Tallennetaan backendiltä saadut elokuvaehdotukset.
  const [suggestions, setSuggestions] = useState([])

  // Määrittää, näytetäänkö hakuehdotukset käyttäjälle.
  const [showSuggestions, setShowSuggestions] = useState(false)

  const navigate = useNavigate()

const user = JSON.parse(localStorage.getItem('user'))

//Poistetaan JWT-cookie backendistä ja paikallinen käyttäjätieto selaimesta.
const logout = async () => {
  try {
    await axios.post(
      'http://localhost:3000/api/db/Logout',
      {},
      {
        withCredentials: true
      }
    )

    localStorage.removeItem('user')
    window.location.reload()
  } catch (error) {
    console.error(error)
  }
}

// Viittaus hakulomakkeeseen ulkopuolisten klikkausten tunnistamista varten.
const searchRef = useRef(null)

// Suljetaan ehdotukset, kun käyttäjä klikkaa hakulomakkeen ulkopuolelle.
useEffect(() => {
  const handleClickOutside = (event) => {
    if (searchRef.current && !searchRef.current.contains(event.target)) {
      setShowSuggestions(false)
    }
  }

  document.addEventListener('mousedown', handleClickOutside)

  return () => {
    document.removeEventListener('mousedown', handleClickOutside)
  }
}, [])

// Haetaan elokuvaehdotuksia käyttäjän kirjoittaessa hakukenttään.
useEffect(() => {
  const query = searchText.trim()

  if (query.length < 2) {
    setSuggestions([])
    return
  }

  const controller = new AbortController()

  const timer = setTimeout(async () => {
    try {
      const response = await axios.get(
        `/movies/search?query=${encodeURIComponent(query)}`,
        { signal: controller.signal }
      )

      if (Array.isArray(response.data)) {
        setSuggestions(response.data.slice(0, 5))
      } else {
        setSuggestions([])
      }
    } catch (error) {
      if (!axios.isCancel(error) && !controller.signal.aborted) {
        console.error('Hakuehdotusten lataus epäonnistui:', error)
        setSuggestions([])
      }
    }
  }, 10)

  return () => {
    clearTimeout(timer)
    controller.abort()
  }
}, [searchText])

  // Siirrytään hakutulossivulle käyttäjän antamalla hakusanalla.
  const handleSearch = (event) => {
    event.preventDefault()

    const query = searchText.trim()

    // Tyhjällä hakusanalla ei käynnistetä hakua.
    if (!query) return

    // Piilotetaan ehdotukset ennen sivulle siirtymistä.
    setShowSuggestions(false)

    navigate(`/search?query=${encodeURIComponent(query)}`)
  }

  // Avataan käyttäjän valitseman elokuvan tietosivu.
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

      {/* Hakukenttä näkyy kaikilla sivuilla. */}
      {/* transform säätää hakukentän pystysuuntaista sijaintia. */}
      <form
        ref={searchRef}
        onSubmit={handleSearch}
        className="navbar-search"
        style={{
          transform: 'translateY(-10px)',
          position: 'relative'
        }}
      >
        <input
          type="search"
          value={searchText}
          onChange={(event) => {
            setSearchText(event.target.value)
            setShowSuggestions(true)
          }}
          onFocus={() => setShowSuggestions(true)}
          placeholder="Hae elokuvia..."
          aria-label="Hae elokuvia"
          autoComplete="off"
        />

        <button type="submit">Hae</button>

        {/* Näytetään ehdotukset vain, jos niitä on saatavilla. */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="search-suggestions">

            {/* Luodaan jokaiselle ehdotetulle elokuvalle oma painike. */}
            {suggestions.map((movie) => (
              <button
                key={movie.id}
                type="button"
                className="search-suggestion"
                onClick={() => handleSuggestionClick(movie)}
              >
                {/* Näytetään elokuvan juliste, jos sellainen löytyy. */}
                {movie.poster_path && (
                  <img
                    src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                    alt=""
                  />
                )}

                {/* Näytetään elokuvan nimi ja julkaisuvuosi. */}
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