import axios from 'axios'

const tmdb = () =>
  axios.create({
    baseURL: 'https://api.themoviedb.org/3',
    headers: { Authorization: `Bearer ${process.env.TMDB_READ_ACCESS_TOKEN}` },
  })

export const getMovie = async (req, res) => {
  try {
    const { data } = await tmdb().get(`/movie/${req.params.id}`, {
      params: {
        language: 'fi-FI',
        // Haetaan näyttelijätiedot
        append_to_response: 'credits'
      }
    })
    res.json(data)
  } catch (err) {
    res.status(err.response?.status || 500).json({ message: err.message })
  }
}

export const getMovieLogo = async (req, res) => {
  try {
    const { data } = await tmdb().get(`/movie/${req.params.id}/images`)
    const logo = data.logos?.[0]
    if (!logo) return res.status(404).json({ message: 'No logo found' })
    res.json({ url: `https://image.tmdb.org/t/p/original${logo.file_path}` })
  } catch (err) {
    res.status(err.response?.status || 500).json({ message: err.message })
  }
}


export const getPopularMovies = async (req, res) => {
  try {
    const { data } = await tmdb().get('/movie/popular', {
      params: {
        language: 'fi-FI',
        page: 1
      }
    })

    res.json(data.results)
  } catch (err) {
    res.status(err.response?.status || 500).json({
      message: 'Elokuvien hakeminen epäonnistui'
    })
  }
}


/* Haetaan viikon trendaavat elokuvat TMDB:stä. */
export const getTrendingMovies = async (req, res) => {
  try {
    // Haetaan viikon trendaavat elokuvat suomenkielisillä tiedoilla.
    const { data } = await tmdb().get('/trending/movie/week', {
      params: { language: 'fi-FI' }
    })

    // Palautetaan haetut elokuvat frontendille.
    res.json(data.results)
  } catch (err) {
    // Palautetaan virheilmoitus, jos haku epäonnistuu.
    res.status(err.response?.status || 500).json({
      message: 'Trendaavien elokuvien hakeminen epäonnistui'
    })
  }
}


/* Haetaan elokuvia TMDB:stä käyttäjän antamalla hakusanalla. */
export const searchMovies = async (req, res) => {
  try {
    // Luetaan hakusana URL-osoitteen query-parametrista.
    const query = req.query.query?.trim()

    // Jos hakusana puuttuu, palautetaan virheilmoitus.
    if (!query) {
      return res.status(400).json({
        message: 'Hakusana puuttuu'
      })
    }

    // Haetaan hakusanaa vastaavat elokuvat TMDB:stä.
    const { data } = await tmdb().get('/search/movie', {
      params: {
        query,
        language: 'fi-FI',
        page: 1
      }
    })

    // Palautetaan hakutulokset frontendille.
    res.json(data.results)
  } catch (err) {
    // Palautetaan virheilmoitus, jos haku epäonnistuu.
    res.status(err.response?.status || 500).json({
      message: 'Elokuvien hakeminen epäonnistui'
    })
  }
}
