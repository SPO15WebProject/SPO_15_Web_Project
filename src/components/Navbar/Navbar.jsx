
import axios from 'axios'
import { NavLink } from 'react-router-dom'
import SearchBar from '../SearchBar/SearchBar.jsx'

function Navbar() {

  // Säilytetään nykyiset kirjautumistoiminnot.
  const user = JSON.parse(localStorage.getItem('user'))

  // Poistetaan JWT-cookie backendistä ja paikallinen käyttäjätieto selaimesta.
  const logout = async () => {
    try {
      await axios.post(
        '/api/db/Logout',
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

  return (
    <nav className="navbar">
      <NavLink to="/" end>Etusivu</NavLink>
      <NavLink to="/trending">Trendaavat</NavLink>
      <NavLink to="/popular">Suositut</NavLink>

      {/* Hakulomake */}
      <SearchBar />

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