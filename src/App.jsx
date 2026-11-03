
import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'

// Tuodaan komponentti, joka näyttää yhden elokuvan tiedot.
import MovieCard from './components/MovieCard'

const API_URL = import.meta.env.VITE_API_URL

function App() {
  // Tallennetaan backendistä haetut suositut elokuvat.
  const [popularMovies, setPopularMovies] = useState([])

  // Tallennetaan backendistä haetut viikon trendaavat elokuvat.
  const [trendingMovies, setTrendingMovies] = useState([])

  // Seurataan suosittujen elokuvien lataamista ja mahdollisia virheitä.
  const [moviesLoading, setMoviesLoading] = useState(true)
  const [moviesError, setMoviesError] = useState(null)

  // Seurataan trendaavien elokuvien lataamista ja mahdollisia virheitä.
  const [trendingLoading, setTrendingLoading] = useState(true)
  const [trendingError, setTrendingError] = useState(null)

  // Haetaan suositut elokuvat backendin kautta TMDB:stä.
  const fetchPopularMovies = async () => {
    setMoviesLoading(true)
    setMoviesError(null)

    try {
      // Lähetetään GET-pyyntö backendin elokuvareittiin.
      const response = await axios.get(`${API_URL}/movies/popular`)

      // Tallennetaan haetut elokuvat Reactin tilaan.
      setPopularMovies(response.data)
    } catch (err) {
      // Näytetään virheilmoitus, jos haku epäonnistuu.
      console.error('Elokuvien hakeminen epäonnistui:', err)
      setMoviesError('Elokuvien hakeminen epäonnistui.')
    } finally {
      // Lopetetaan lataustila haun valmistuttua.
      setMoviesLoading(false)
    }
  }

  // Haetaan viikon trendaavat elokuvat backendin kautta TMDB:stä.
  const fetchTrendingMovies = async () => {
    setTrendingLoading(true)
    setTrendingError(null)

    try {
      // Lähetetään GET-pyyntö backendin trending-reittiin.
      const response = await axios.get(`${API_URL}/movies/trending`)

      // Tallennetaan haetut trendaavat elokuvat Reactin tilaan.
      setTrendingMovies(response.data)
    } catch (err) {
      // Näytetään virheilmoitus, jos haku epäonnistuu.
      console.error('Trendaavien elokuvien hakeminen epäonnistui:', err)
      setTrendingError('Trendaavien elokuvien hakeminen epäonnistui.')
    } finally {
      // Lopetetaan lataustila haun valmistuttua.
      setTrendingLoading(false)
    }
  }

  // Haetaan molemmat elokuvalistat, kun sivu avataan.
  useEffect(() => {
    fetchPopularMovies()
    fetchTrendingMovies()
  }, [])

  return (
    <>
      <h1>SPO_15</h1>

      {/* Viikon trendaavien elokuvien osio */}
      <section>
        <h2>Trendaavat elokuvat</h2>

        {/* Näytetään ilmoitus lataamisen aikana. */}
        {trendingLoading && <p>Ladataan trendaavia elokuvia...</p>}

        {/* Näytetään mahdollinen virheilmoitus. */}
        {trendingError && <p role="alert">{trendingError}</p>}

        {/* Ilmoitetaan, jos trendaavia elokuvia ei löytynyt. */}
        {!trendingLoading && !trendingError && trendingMovies.length === 0 && (
          <p>Trendaavia elokuvia ei löytynyt.</p>
        )}

        {/* Näytetään trendaavat elokuvat yhdellä vaakasuunnassa selattavalla rivillä. */}
        <div className="trending-slider">
          {trendingMovies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </section>

      {/* Suosittujen elokuvien osio */}
      <section>
        <h2>Suositut elokuvat</h2>

        {/* Näytetään ilmoitus lataamisen aikana. */}
        {moviesLoading && <p>Ladataan elokuvia...</p>}

        {/* Näytetään mahdollinen virheilmoitus. */}
        {moviesError && <p role="alert">{moviesError}</p>}

        {/* Ilmoitetaan, jos elokuvia ei löytynyt. */}
        {!moviesLoading && !moviesError && popularMovies.length === 0 && (
          <p>Elokuvia ei löytynyt.</p>
        )}

        {/* Näytetään haetut elokuvat responsiivisessa ruudukossa. */}
        <div className="movie-grid">
          {popularMovies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </section>
    </>
  )
}

export default App
