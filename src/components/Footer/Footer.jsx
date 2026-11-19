import { Link } from 'react-router-dom'
import './Footer.css'

// Sivuston yhteinen alatunniste.
function Footer() {

  // Vieritetään sivu takaisin alkuun.
  const scrollToTop = () => {
    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches

    window.scrollTo({
      top: 0,
      behavior: reducedMotion ? 'instant' : 'smooth'
    })
  }

  return (
    <footer className="site-footer">

      <div className="footer-content">

        {/* Sovelluksen esittely */}
        <section className="footer-section">
          <h3>Elokuvasovellus</h3>

          <p>
            Löydä uusia elokuvia, tutustu suosikkeihisi
            ja selaa elokuvamaailmaa.
          </p>
        </section>

        {/* Sivuston navigaatiolinkit */}
        <nav
          className="footer-section"
          aria-label="Alatunnisteen navigointi"
        >
          <h3>Navigointi</h3>

          <Link to="/" onClick={scrollToTop}>
            Etusivu
          </Link>

          <Link to="/popular" onClick={scrollToTop}>
            Suositut elokuvat
          </Link>

          <Link to="/trending" onClick={scrollToTop}>
            Trendaavat elokuvat
          </Link>
        </nav>

        {/* Projektin tiedot ja elokuvatietojen lähde */}
        <section className="footer-section">
          <h3>Tietoa projektista</h3>

          <a
            href="https://github.com/SPO15WebProject/SPO_15_Web_Project"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>

          <a
            href="https://www.themoviedb.org/"
            target="_blank"
            rel="noopener noreferrer"
          >
            The Movie Database (TMDB)
          </a>

          <p className="footer-attribution">
            Elokuvatietojen lähde
          </p>
        </section>

      </div>

      {/* Alatunnisteen alarivi */}
      <div className="footer-bottom">

        <p>
          © {new Date().getFullYear()} Elokuvasovellus
        </p>

        {/* Sivun alkuun palaaminen */}
        <button
          type="button"
          className="footer-top-button"
          onClick={scrollToTop}
        >
          Takaisin ylös

          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 19V5" />
            <path d="m5 12 7-7 7 7" />
          </svg>

        </button>

      </div>

    </footer>
  )
}

export default Footer