import { Routes, Route } from 'react-router-dom'
import './App.css'

import Navbar from './components/Navbar/Navbar'
import HomePage from './pages/Homepage/Homepage'
import PopularPage from './pages/Popularpage/Popularpage'
import TrendingPage from './pages/Trendingpage/Trendingpage'
import MovieDetails from './pages/Detailspage/MovieDetails'
import SearchPage from './pages/Searchpage/Searchpage'
import LoginPage from './pages/Loginpage/LoginPage'
import RegisterPage from './pages/RegisterPage/RegisterPage'

// App vastaa vain sovelluksen rungosta ja reiteistä.
function App() {
  return (
    <>
      <Navbar />

      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/popular" element={<PopularPage />} />
          <Route path="/trending" element={<TrendingPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/movies/:id" element={<MovieDetails />} />

          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Näytetään ilmoitus, jos osoitetta ei löydy. */}
          <Route path="*" element={<p>Sivua ei löytynyt.</p>} />
        </Routes>
      </main>
    </>
  )
}

export default App