import { NavLink, useNavigate } from 'react-router-dom'
import SearchBar from '../SearchBar/SearchBar'
import Icon from '../Icon/Icon'
import { useAuth } from '../../context/AuthContext'
import './Navbar.css'

function Navbar() {
  const { user, loading, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/')
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
        {/* Ei näytetä mitään ennen kuin palvelin on kertonut kirjautumistilan */}
        {!loading && (
          user ? (
            <>
              <NavLink to="/account" className="navbar-user" aria-label="Oma tili">
                <Icon name="user" />
                <span>{user.nickname}</span>
              </NavLink>

              <button
                className="navbar-logout"
                onClick={handleLogout}
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
          )
        )}
      </div>
    </header>
  )
}

export default Navbar