import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'

function Navbar() {
  const [searchText, setSearchText] = useState('')
  const navigate = useNavigate()

  const user = JSON.parse(localStorage.getItem('user'))

  const logout = () => {
    localStorage.removeItem('user')
    window.location.reload()
  }

  // Siirrytään hakutulossivulle käyttäjän antamalla hakusanalla.
  const handleSearch = (event) => {
    event.preventDefault()

    const query = searchText.trim()

    // Tyhjällä hakusanalla ei käynnistetä hakua.
    if (!query) return

    navigate(`/search?query=${encodeURIComponent(query)}`)
  }

  return (
    <nav className="navbar">
      <NavLink to="/" end>Etusivu</NavLink>
      <NavLink to="/trending">Trendaavat</NavLink>
      <NavLink to="/popular">Suositut</NavLink>

      {/* Hakukenttä näkyy kaikilla sivuilla. */}
      {/* style säätää missä y akselilla hakukenttä on. */}
      <form
        onSubmit={handleSearch}
        className="navbar-search"
        style={{ transform: 'translateY(-10px)' }}
      >
        <input
          type="search"
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
          placeholder="Hae elokuvia..."
          aria-label="Hae elokuvia"
        />
        <button type="submit">Hae</button>
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