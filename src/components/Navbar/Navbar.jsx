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

  // Viittaus hakulomakkeeseen ulkopuolisten klikkausten tunnistamista varten.
  const searchRef = useRef(null)

  // Suljetaan ehdotukset, kun käyttäjä klikkaa hakulomakkeen ulkopuolelle.
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Tarkistetaan, tapahtuiko klikkaus lomakkeen ulkopuolella.
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false)
      }
    }

    // Kuunnellaan hiiren klikkauksia koko sivulla.
    document.addEventListener('mousedown', handleClickOutside)

    // Poistetaan tapahtumankuuntelija, kun komponentti poistuu käytöstä.
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Haetaan elokuvaehdotuksia käyttäjän kirjoittaessa hakukenttään.
  useEffect(() => {
    const query = searchText.trim()

    // Alle kahden merkin hakusanalla ei haeta ehdotuksia.
    if (query.length < 2) {
      setSuggestions([])
      return
    }

    // Mahdollistaa vanhan API-pyynnön peruuttamisen.
    const controller = new AbortController()

    // Odotetaan 10 ms, ettei jokainen näppäinpainallus
    // aiheuta uutta API-pyyntöä.
    const timer = setTimeout(async () => {
      try {
        const response = await axios.get(
          `/movies/search?query=${encodeURIComponent(query)}`,
          { signal: controller.signal }
        )

        // Varmistetaan, että vastaus on elokuvataulukko.
        if (Array.isArray(response.data)) {
          // Näytetään korkeintaan viisi elokuvaehdotusta.
          setSuggestions(response.data.slice(0, 5))
        } else {
          setSuggestions([])
        }
      } catch (error) {
        // Peruutettua pyyntöä ei käsitellä virheenä.
        if (!axios.isCancel(error) && !controller.signal.aborted) {
          console.error('Hakuehdotusten lataus epäonnistui:', error)
          setSuggestions([])
        }
      }
    }, 10)

    // Peruutetaan ajastin ja vanha pyyntö,
    // jos käyttäjä jatkaa kirjoittamista.
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
    </nav>
  )
}

export default Navbar