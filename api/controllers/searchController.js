import { getMovieFilters } from '../services/movieFilters.js'
import {
  searchByName,
  searchByActor,
  searchByGenre,
  searchByOrigin,
  fetchGenres,
  fetchCountries,
  fetchLanguages
} from '../services/movieSearchService.js'

// Tarkistetaan sivunumeron kelvollisuus.
function isValidPage(page) {
  return Number.isInteger(page) && page >= 1 && page <= 500
}

/* Haetaan elokuvia nimen perusteella, sivu kerrallaan. */
export const searchMovies = async (req, res) => {
  try {
    const query = req.query.query?.trim()
    const page = Number(req.query.page || 1)

    if (!query) {
      return res.status(400).json({
        message: 'Hakusana puuttuu'
      })
    }

    if (!isValidPage(page)) {
      return res.status(400).json({
        message: 'Virheellinen sivunumero'
      })
    }

    let filters

    try {
      filters = getMovieFilters(req.query)
    } catch (err) {
      return res.status(400).json({
        message: err.message
      })
    }

    // Haetaan elokuvat palvelutiedoston avulla.
    const results = await searchByName(query, page, filters)

    res.json(results)

  } catch (err) {
    res.status(err.response?.status || 500).json({
      message: 'Elokuvien hakeminen epäonnistui'
    })
  }
}


/* Haetaan elokuvia näyttelijän nimen perusteella. */
export const searchMoviesByActor = async (req, res) => {
  try {
    const query = req.query.query?.trim()
    const page = Number(req.query.page || 1)

    if (!query) {
      return res.status(400).json({
        message: 'Näyttelijän nimi puuttuu'
      })
    }

    if (!isValidPage(page)) {
      return res.status(400).json({
        message: 'Virheellinen sivunumero'
      })
    }

    let filters

    try {
      filters = getMovieFilters(req.query)
    } catch (err) {
      return res.status(400).json({
        message: err.message
      })
    }

    // Haetaan näyttelijän elokuvat.
    const results = await searchByActor(query, page, filters)

    res.json(results)

  } catch (err) {
    res.status(err.response?.status || 500).json({
      message: 'Näyttelijän elokuvien hakeminen epäonnistui'
    })
  }
}


/* Haetaan elokuvia yhden tai useamman genren perusteella. */
export const searchMoviesByGenre = async (req, res) => {
  try {
    const genre = String(req.query.genre || '')
    const page = Number(req.query.page || 1)

    // Esimerkiksi 28,35 tarkoittaa toimintaa ja komediaa.
    const genreIds = genre.split(',')

    // Jokaisen genren pitää olla positiivinen kokonaisluku.
    if (
      !genre ||
      genreIds.some(id => !/^[1-9]\d*$/.test(id))
    ) {
      return res.status(400).json({
        message: 'Virheellinen genre'
      })
    }

    if (!isValidPage(page)) {
      return res.status(400).json({
        message: 'Virheellinen sivunumero'
      })
    }

    let filters

    try {
      filters = getMovieFilters(req.query)
    } catch (err) {
      return res.status(400).json({
        message: err.message
      })
    }

    // Yksi genre lähetetään numerona ja useat merkkijonona.
    const selectedGenres =
      genreIds.length === 1 ? Number(genreIds[0]) : genre

    // Haetaan valittujen genrejen elokuvat.
    const results = await searchByGenre(
      selectedGenres,
      page,
      filters
    )

    res.json(results)

  } catch (err) {
    res.status(err.response?.status || 500).json({
      message: 'Genren elokuvien hakeminen epäonnistui'
    })
  }
}


/* Haetaan elokuvien genret TMDB:stä. */
export const getGenres = async (req, res) => {
  try {
    const genres = await fetchGenres()

    res.json(genres)

  } catch (err) {
    res.status(err.response?.status || 500).json({
      message: 'Genrejen hakeminen epäonnistui'
    })
  }
}


/* Haetaan elokuvia alkuperämaan tai alkuperäisen kielen perusteella. */
export const searchMoviesByOrigin = async (req, res) => {
  const page = Number(req.query.page || 1)

  // Tarkistetaan sivunumeron kelvollisuus.
  if (!isValidPage(page)) {
    return res.status(400).json({
      message: 'Virheellinen sivunumero'
    })
  }

  let filters

  try {
    // Muodostetaan kaikki käyttäjän valitsemat suodattimet.
    filters = getMovieFilters(req.query)

    // Vähintään maa tai kieli pitää olla valittuna.
    if (
      !filters.with_origin_country &&
      !filters.with_original_language
    ) {
      throw new Error('Valitse maa tai kieli')
    }

  } catch (err) {
    return res.status(400).json({
      message: err.message
    })
  }

  try {
    // Haetaan elokuvat maan tai kielen perusteella.
    const results = await searchByOrigin(page, filters)

    res.json(results)

  } catch (err) {
    res.status(err.response?.status || 500).json({
      message: 'Maa- tai kielihaku epäonnistui'
    })
  }
}


/* Haetaan maiden valintalista TMDB:stä. */
export const getCountries = async (req, res) => {
  try {
    const countries = await fetchCountries()

    res.json(countries)

  } catch (err) {
    res.status(err.response?.status || 500).json({
      message: 'Maiden lataus epäonnistui'
    })
  }
}


/* Haetaan kielten valintalista TMDB:stä. */
export const getLanguages = async (req, res) => {
  try {
    const languages = await fetchLanguages()

    res.json(languages)

  } catch (err) {
    res.status(err.response?.status || 500).json({
      message: 'Kielten lataus epäonnistui'
    })
  }
}