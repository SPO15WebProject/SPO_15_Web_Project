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

/* Haetaan elokuvia nimen perusteella, sivu kerrallaan. */
export const searchMovies = async (req, res) => {
  try {
    const query = req.query.query?.trim()
    const page = Number(req.query.page || 1)

    // Tarkistetaan hakusana.
    if (!query) {
      return res.status(400).json({
        message: 'Hakusana puuttuu'
      })
    }

    // Tarkistetaan sivunumero.
    if (!Number.isInteger(page) || page < 1 || page > 500) {
      return res.status(400).json({
        message: 'Virheellinen sivunumero'
      })
    }

    // Haetaan pyydetty sivu TMDB:stä.
    const { data } = await tmdb().get('/search/movie', {
      params: {
        query,
        language: 'fi-FI',
        page
      }
    })

    // Palautetaan elokuvat ja sivutustiedot.
    res.json({
      results: data.results,
      page: data.page,
      total_pages: data.total_pages
    })

  } catch (err) {
    res.status(err.response?.status || 500).json({
      message: 'Elokuvien hakeminen epäonnistui'
    })
  }
}

/* Haetaan elokuvia näyttelijän nimen perusteella, sivu kerrallaan. */
export const searchMoviesByActor = async (req, res) => {
  try {
    // Luetaan näyttelijän nimi ja haluttu sivunumero.
    const query = req.query.query?.trim()
    const page = Number(req.query.page || 1)

    // Tarkistetaan, että käyttäjä antoi nimen.
    if (!query) {
      return res.status(400).json({
        message: 'Näyttelijän nimi puuttuu'
      })
    }

    // Tarkistetaan, että sivunumero on kelvollinen.
    if (!Number.isInteger(page) || page < 1 || page > 500) {
      return res.status(400).json({
        message: 'Virheellinen sivunumero'
      })
    }

    // Etsitään näyttelijä TMDB:stä nimen perusteella.
    const { data: peopleData } = await tmdb().get('/search/person', {
      params: {
        query,
        language: 'fi-FI',
        page: 1
      }
    })

    // Valitaan ensimmäinen näyttelijäksi luokiteltu osuma.
    const actor = peopleData.results.find(
      person => person.known_for_department === 'Acting'
    )

    // Jos näyttelijää ei löydy, palautetaan tyhjät tulokset
    // samassa muodossa kuin onnistuneessa haussa.
    if (!actor) {
      return res.json({
        results: [],
        page: 1,
        total_pages: 0
      })
    }

    // Haetaan haluttu sivu näyttelijän elokuvista.
    const { data: movieData } = await tmdb().get('/discover/movie', {
      params: {
        with_cast: actor.id,
        language: 'fi-FI',
        sort_by: 'popularity.desc',
        page
      }
    })

    // Palautetaan elokuvat ja sivutustiedot frontendille.
    res.json({
      results: movieData.results,
      page: movieData.page,
      total_pages: movieData.total_pages
    })

  } catch (err) {
    // Ilmoitetaan virheestä, jos TMDB-haku epäonnistuu.
    res.status(err.response?.status || 500).json({
      message: 'Näyttelijän elokuvien hakeminen epäonnistui'
    })
  }
}