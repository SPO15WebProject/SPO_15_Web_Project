import { tmdb } from '../services/tmdbConnection.js'

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


/* Haetaan elokuvia genren perusteella, sivu kerrallaan. */
export const searchMoviesByGenre = async (req, res) => {
  try {
    // Luetaan genren tunniste ja haluttu sivunumero.
    const genre = Number(req.query.genre)
    const page = Number(req.query.page || 1)

    // Tarkistetaan genren tunniste.
    if (!Number.isInteger(genre) || genre < 1) {
      return res.status(400).json({
        message: 'Virheellinen genre'
      })
    }

    // Tarkistetaan sivunumero.
    if (!Number.isInteger(page) || page < 1 || page > 500) {
      return res.status(400).json({
        message: 'Virheellinen sivunumero'
      })
    }

    // Haetaan valitun genren elokuvat TMDB:stä.
    const { data } = await tmdb().get('/discover/movie', {
      params: {
        with_genres: genre,
        language: 'fi-FI',
        sort_by: 'popularity.desc',
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
      message: 'Genren elokuvien hakeminen epäonnistui'
    })
  }
}


/* Haetaan elokuvien genret TMDB:stä. */
export const getGenres = async (req, res) => {
  try {
    // Haetaan genrelista suomenkielisillä nimillä.
    const { data } = await tmdb().get('/genre/movie/list', {
      params: {
        language: 'fi'
      }
    })

    // Palautetaan genret frontendille.
    res.json(data.genres)

  } catch (err) {
    res.status(err.response?.status || 500).json({
      message: 'Genrejen hakeminen epäonnistui'
    })
  }
}