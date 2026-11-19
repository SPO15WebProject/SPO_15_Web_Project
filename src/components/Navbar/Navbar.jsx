import axios from 'axios'
import { NavLink } from 'react-router-dom'
import SearchBar from '../SearchBar/SearchBar'
import Icon from '../Icon/Icon'
import './Navbar.css'

function Navbar() {
  const user = JSON.parse(localStorage.getItem('user'))

  const logout = async () => {
    try {
      await axios.post('/api/db/Logout', {}, {
        withCredentials: true
      })

      localStorage.removeItem('user')
      window.location.href = '/'
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <header className="navbar">
      <NavLink to="/" className="navbar-brand">
        SPO_15
      </NavLink>

      <div className="navbar-search">
        <SearchBar />
      </div>

      <div className="navbar-actions">
        {user ? (
          <>
            <NavLink to="/account" className="navbar-user" aria-label="Oma tili">
              <Icon name="user" />
              <span>{user.nickname}</span>
            </NavLink>

            <button
              className="navbar-logout"
              onClick={logout}
              title="Kirjaudu ulos"
              aria-label="Kirjaudu ulos"
            >
              <Icon name="logout" size={20} />
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login" className="navbar-login">
              Kirjaudu
            </NavLink>

            <NavLink to="/register" className="navbar-register">
              Rekisteröidy
            </NavLink>
          </>
        )}
      </div>
    </header>
  )
}

export default Navbar