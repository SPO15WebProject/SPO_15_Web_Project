import { tmdb } from '../services/tmdbConnection.js'
import {
  getMovieFilters,
  filterMoviesByRating,
  sortMovies
} from '../services/movieFilters.js'

// Nimihaun suodatuksen enimmäissivumäärä TMDB:ssä.
const MAX_SEARCH_PAGES = 10

// Frontendille palautettavien elokuvien määrä sivulla.
const PAGE_SIZE = 20


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

    if (!Number.isInteger(page) || page < 1 || page > 500) {
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

    const params = {
      query,
      language: 'fi-FI',
      page
    }

    if (filters.primary_release_year) {
      params.primary_release_year = filters.primary_release_year
    }

    const hasRatingFilter =
      filters['vote_average.gte'] !== undefined

    const hasSorting = Boolean(filters.sort_by)

    // Jos erillistä suodatusta tai järjestämistä ei tarvita,
    // haetaan suoraan käyttäjän pyytämä tulossivu.
    if (
      !hasRatingFilter &&
      !hasSorting &&
      !filters.with_origin_country &&
      !filters.with_original_language
    ) {
      const { data } = await tmdb().get('/search/movie', {
        params
      })

      return res.json({
        results: data.results,
        page: data.page,
        total_pages: data.total_pages
      })
    }

    // Haetaan ensimmäinen tulossivu.
    const { data: firstPage } = await tmdb().get('/search/movie', {
      params: {
        ...params,
        page: 1
      }
    })

    // Rajoitetaan käsiteltävien sivujen määrää.
    const pagesToFetch = Math.min(
      firstPage.total_pages,
      MAX_SEARCH_PAGES
    )

    const movies = [...firstPage.results]

    // Haetaan loput käsiteltävät tulossivut.
    for (let currentPage = 2; currentPage <= pagesToFetch; currentPage++) {
      const { data } = await tmdb().get('/search/movie', {
        params: {
          ...params,
          page: currentPage
        }
      })

      movies.push(...data.results)
    }

    // Poistetaan mahdolliset samat elokuvat.
    const uniqueMovies = [
      ...new Map(
        movies.map(movie => [movie.id, movie])
      ).values()
    ]

    // Nimihaku ei tue maa- ja kielisuodatusta suoraan.
    // Suodatetaan elokuvat ensin alkuperäisen kielen mukaan.
    let matchingMovies = uniqueMovies.filter(movie =>
      !filters.with_original_language ||
      movie.original_language === filters.with_original_language
    )

    // Nimihakutuloksissa ei yleensä ole alkuperämaata.
    // Haetaan tarvittaessa elokuvien tarkemmat tiedot.
    if (filters.with_origin_country) {

      const matches = []

      // Haetaan tiedot viiden elokuvan erissä,
      // jotta samanaikaisia API-pyyntöjä ei synny liikaa.
      for (let i = 0; i < matchingMovies.length; i += 5) {

        const batch = await Promise.all(
          matchingMovies.slice(i, i + 5).map(async movie => {

            const { data } = await tmdb().get(
              `/movie/${movie.id}`
            )

            // Palautetaan elokuva vain, jos alkuperämaa täsmää.
            return data.origin_country?.includes(
              filters.with_origin_country
            ) ? movie : null

          })
        )

        // Poistetaan elokuvat, joiden alkuperämaa ei täsmännyt.
        matches.push(...batch.filter(Boolean))
      }

      matchingMovies = matches
    }

    // Suodatetaan elokuvat arvosanan perusteella.
    const filteredMovies = filterMoviesByRating(
      matchingMovies,
      filters
    )

    // Järjestetään elokuvat valitulla tavalla.
    const sortedMovies = sortMovies(
      filteredMovies,
      filters
    )

    // Lasketaan tulossivujen kokonaismäärä.
    const totalPages = Math.ceil(
      sortedMovies.length / PAGE_SIZE
    )

    const startIndex = (page - 1) * PAGE_SIZE
    const endIndex = startIndex + PAGE_SIZE

    // Palautetaan frontendille pyydetty tulossivu.
    res.json({
      results: sortedMovies.slice(startIndex, endIndex),
      page,
      total_pages: totalPages,
      total_results: sortedMovies.length,
      truncated: firstPage.total_pages > MAX_SEARCH_PAGES
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
    const query = req.query.query?.trim()
    const page = Number(req.query.page || 1)

    if (!query) {
      return res.status(400).json({
        message: 'Näyttelijän nimi puuttuu'
      })
    }

    if (!Number.isInteger(page) || page < 1 || page > 500) {
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

    const { data: peopleData } = await tmdb().get('/search/person', {
      params: {
        query,
        language: 'fi-FI',
        page: 1
      }
    })

    const actor = peopleData.results.find(
      person => person.known_for_department === 'Acting'
    )

    if (!actor) {
      return res.json({
        results: [],
        page: 1,
        total_pages: 0
      })
    }

    // Discover tukee myös maa- ja kielisuodattimia.
    const { data: movieData } = await tmdb().get('/discover/movie', {
      params: {
        with_cast: actor.id,
        language: 'fi-FI',
        sort_by: 'popularity.desc',
        page,
        ...filters
      }
    })

    res.json({
      results: movieData.results,
      page: movieData.page,
      total_pages: movieData.total_pages
    })

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

    if (!Number.isInteger(page) || page < 1 || page > 500) {
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

    // Yksi genre lähetetään numerona vanhan toiminnan säilyttämiseksi.
    // Useat genret lähetetään pilkuilla erotettuna merkkijonona.
    const selectedGenres =
      genreIds.length === 1 ? Number(genreIds[0]) : genre

    const { data } = await tmdb().get('/discover/movie', {
      params: {
        with_genres: selectedGenres,
        language: 'fi-FI',
        sort_by: 'popularity.desc',
        page,
        ...filters
      }
    })

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
    const { data } = await tmdb().get('/genre/movie/list', {
      params: {
        language: 'fi'
      }
    })

    res.json(data.genres)

  } catch (err) {
    res.status(err.response?.status || 500).json({
      message: 'Genrejen hakeminen epäonnistui'
    })
  }
}


/* Haetaan elokuvia alkuperämaan tai alkuperäisen kielen perusteella. */
export const searchMoviesByOrigin = async (req, res) => {

  // Luetaan pyydetty sivunumero.
  const page = Number(req.query.page || 1)

  // Tarkistetaan sivunumeron kelvollisuus.
  if (!Number.isInteger(page) || page < 1 || page > 500) {
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

    // Maa- ja kielihaku käyttävät samaa discover-rajapintaa.
    const { data } = await tmdb().get('/discover/movie', {
      params: {
        language: 'fi-FI',
        sort_by: 'popularity.desc',
        page,
        ...filters
      }
    })

    // Palautetaan hakutulokset ja sivutustiedot.
    res.json({
      results: data.results,
      page: data.page,
      total_pages: data.total_pages
    })

  } catch (err) {
    res.status(err.response?.status || 500).json({
      message: 'Maa- tai kielihaku epäonnistui'
    })
  }
}


/* Haetaan maiden valintalista TMDB:stä. */
export const getCountries = async (req, res) => {
  try {

    const { data } = await tmdb().get(
      '/configuration/countries'
    )

    // Palautetaan maat frontendin valintavalikkoon.
    res.json(data)

  } catch (err) {
    res.status(err.response?.status || 500).json({
      message: 'Maiden lataus epäonnistui'
    })
  }
}


/* Haetaan kielten valintalista TMDB:stä. */
export const getLanguages = async (req, res) => {
  try {

    const { data } = await tmdb().get(
      '/configuration/languages'
    )

    // Palautetaan kielet frontendin valintavalikkoon.
    res.json(data)

  } catch (err) {
    res.status(err.response?.status || 500).json({
      message: 'Kielten lataus epäonnistui'
    })
  }
}