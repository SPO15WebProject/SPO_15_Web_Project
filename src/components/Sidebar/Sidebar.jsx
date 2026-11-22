import { NavLink } from 'react-router-dom'
import Icon from '../Icon/Icon'
import './Sidebar.css'

function Sidebar() {
  return (
    <aside className="sidebar">
      <nav className="sidebar-navigation" aria-label="Sivupalkin navigointi">
        <NavLink to="/" end className="sidebar-link" title="Etusivu" aria-label="Etusivu">
          <Icon name="home" />
        </NavLink>

        <NavLink to="/popular" className="sidebar-link" title="Suositut" aria-label="Suositut">
          <Icon name="film" />
        </NavLink>

        <NavLink to="/trending" className="sidebar-link" title="Trendaavat" aria-label="Trendaavat">
          <Icon name="trending" />
        </NavLink>

        <div className="sidebar-divider" />

        <NavLink to="/groups/new" className="sidebar-link" title="Luo ryhmä" aria-label="Luo ryhmä">
          <Icon name="group" />
        </NavLink>

        <NavLink to="/profile"
        className="sidebar-link"
        title="Profiili"
        >
          <Icon name="user" />
        </NavLink>

        <NavLink to="/account" className="sidebar-link" title="Oma tili" aria-label="Oma tili">
          <Icon name="user" />
        </NavLink>
      </nav>
    </aside>
  )
}

export default Sidebar