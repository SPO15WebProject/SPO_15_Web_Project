import { Routes, Route } from 'react-router-dom'
import './App.css'

import Navbar from './components/Navbar/Navbar'
import HomePage from './pages/Homepage/Homepage'
import PopularPage from './pages/Popularpage/Popularpage'
import TrendingPage from './pages/Trendingpage/Trendingpage'

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

          {/* Näytetään ilmoitus, jos osoitetta ei löydy. */}
          <Route path="*" element={<p>Sivua ei löytynyt.</p>} />
        </Routes>
      </main>
    </>
  )
}

export default App